using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PromoteSeaTourism.Controllers.Common;
using PromoteSeaTourism.Data;
using PromoteSeaTourism.DTOs;
using PromoteSeaTourism.Models;

namespace PromoteSeaTourism.Controllers
{
    [Route("api")]
    public class ArticlesController : AppControllerBase
    {
        public ArticlesController(AppDbContext db) : base(db) { }

        // ==== LIST (public) ====
        // Trả mỗi article kèm 1 ảnh: ưu tiên cover; nếu không có cover thì lấy ảnh đầu tiên theo IsCover/Position
        [HttpGet("articles/list"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> List(
            int page = 1,
            int pageSize = 20,
            bool? published = null)
        {
            var q = _db.Articles.AsNoTracking();
            if (published.HasValue) q = q.Where(x => x.IsPublished == published.Value);
            q = q.OrderByDescending(x => x.PublishedAt ?? x.CreatedAt);

            var total = await q.CountAsync();

            // lấy trang trước (chỉ field cần thiết)
            var pageItems = await Page(q, page, pageSize)
                .Select(a => new
                {
                    a.Id,
                    a.Title,
                    a.Slug,
                    a.Summary,
                    a.Content,
                    a.CoverImageId,
                    a.CategoryId,
                    a.IsPublished,
                    a.PublishedAt,
                    a.CreatedAt,
                    a.UpdatedAt
                })
                .ToListAsync();

            if (pageItems.Count == 0)
                return Ok(new PagedResponse<object>(200, "No articles found.", total, page, pageSize, Array.Empty<object>()));

            // 1) Map CoverImageId -> Url
            var coverIds = pageItems.Where(x => x.CoverImageId.HasValue)
                                    .Select(x => x.CoverImageId!.Value)
                                    .Distinct()
                                    .ToArray();

            var coverUrlMap = coverIds.Length == 0
                ? new Dictionary<long, string>()
                : await _db.Images.AsNoTracking()
                      .Where(m => coverIds.Contains(m.Id))
                      .Select(m => new { m.Id, m.Url })
                      .ToDictionaryAsync(x => x.Id, x => x.Url);

            // 2) Fallback: lấy ảnh đầu tiên trong gallery cho các bài chưa có coverUrl
            var articleIds = pageItems.Select(x => x.Id).ToArray();

            var orderedLinks = await _db.ImageLinks.AsNoTracking()
                .Include(l => l.Image)
                .Where(l => l.TargetType == ImageOwner.Article && articleIds.Contains(l.TargetId))
                .OrderBy(l => l.TargetId)
                .ThenByDescending(l => l.IsCover) // ưu tiên link đánh dấu cover
                .ThenBy(l => l.Position)          // rồi theo vị trí
                .ThenBy(l => l.Id)                // ổn định
                .Select(l => new { l.TargetId, l.Image.Url })
                .ToListAsync();

            var firstLinkUrlByArticle = new Dictionary<long, string>();
            foreach (var link in orderedLinks)
            {
                if (!firstLinkUrlByArticle.ContainsKey(link.TargetId))
                    firstLinkUrlByArticle[link.TargetId] = link.Url;
            }

            // 3) Build kết quả: thumbnailUrl = coverUrl (nếu có) hoặc fallbackUrl
            var items = pageItems.Select(a =>
            {
                string? coverUrl = null;
                if (a.CoverImageId.HasValue && coverUrlMap.TryGetValue(a.CoverImageId.Value, out var cu))
                    coverUrl = cu;

                string? thumb = coverUrl;
                if (thumb == null && firstLinkUrlByArticle.TryGetValue(a.Id, out var fb))
                    thumb = fb;

                return new
                {
                    a.Id,
                    a.Title,
                    a.Slug,
                    a.Summary,
                    a.Content,
                    a.CoverImageId,
                    ThumbnailUrl = thumb,   // thumbnail kèm theo
                    a.CategoryId,
                    a.IsPublished,
                    a.PublishedAt,
                    a.CreatedAt,
                    a.UpdatedAt
                };
            });

            return Ok(new PagedResponse<object>(200, "Success", total, page, pageSize, items));
        }

        // ==== GET BY ID (public) ====
        [HttpGet("articles/get/{id:long}"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<object>> Get(long id)
        {
            var a = await _db.Articles
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (a is null)
                return NotFound(new ApiResponse<object>(404, $"Article with id={id} not found.", null));

            // gallery
            var gallery = await _db.ImageLinks
                .AsNoTracking()
                .Include(l => l.Image)
                .Where(l => l.TargetType == ImageOwner.Article && l.TargetId == id)
                .OrderBy(l => l.Position)
                .Select(l => new
                {
                    LinkId = l.Id,
                    MediaId = l.ImageId,
                    l.IsCover,
                    l.Position,
                    l.Image.Url,
                    l.Image.AltText,
                    l.Image.Caption
                })
                .ToListAsync();

            var data = new
            {
                a.Id, a.Title, a.Slug, a.Summary, a.Content,
                a.CategoryId, a.IsPublished, a.PublishedAt, a.CreatedAt, a.UpdatedAt,
                CoverImageId = a.CoverImageId,
                Images = gallery
            };

            return Ok(new ApiResponse<object>(200, "Success", data));
        }

        // ==== CREATE (one-step with images) ====
        [HttpPost("articles/create"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<object>> Create([FromBody] CreateArticleWithImagesDto dto)
        {
            using var tx = await _db.Database.BeginTransactionAsync();

            try
            {
                var e = new Article
                {
                    Title = dto.Title,
                    Slug = dto.Slug,
                    Summary = dto.Summary,
                    Content = dto.Content,
                    CategoryId = dto.CategoryId,
                    IsPublished = dto.IsPublished,
                    PublishedAt = dto.PublishedAt,
                    CreatedAt = DateTime.UtcNow
                };
                _db.Articles.Add(e);
                await _db.SaveChangesAsync();

                // Ảnh mới gửi kèm
                if (dto.Images is { Length: > 0 })
                {
                    // tạo media trước
                    var medias = new List<Image>();
                    foreach (var img in dto.Images)
                    {
                        var m = new Image
                        {
                            Url = img.Url,
                            AltText = img.AltText,
                            Caption = img.Caption,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = User.UserId()
                        };
                        _db.Images.Add(m);
                        medias.Add(m);
                    }
                    await _db.SaveChangesAsync();

                    // link ảnh vào article
                    foreach (var (img, idx) in dto.Images.Select((v, i) => (v, i)))
                    {
                        var mediaId = medias[idx].Id;
                        _db.ImageLinks.Add(new ImageLink
                        {
                            ImageId = mediaId,
                            TargetType = ImageOwner.Article,
                            TargetId = e.Id,
                            Position = img.Position,
                            IsCover = img.IsCover,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                    await _db.SaveChangesAsync();

                    // nếu có ảnh IsCover, đặt cover cho bài
                    var coverImg = dto.Images.FirstOrDefault(x => x.IsCover);
                    if (coverImg != null)
                    {
                        var coverMediaId = medias[dto.Images.ToList().IndexOf(coverImg)].Id;
                        e.CoverImageId = coverMediaId;
                        await _db.SaveChangesAsync();
                    }
                }

                await tx.CommitAsync();
                return CreatedAtAction(nameof(Get), new { id = e.Id },
                    new ApiResponse<object>(201, "Article created successfully.", new { id = e.Id }));
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return StatusCode(500, new ApiResponse<object>(500, $"Failed to create article: {ex.Message}", null));
            }
        }

        // ==== UPDATE (one-step: add new images / attach existing / remove / reorder / set cover) ====
        [HttpPut("articles/update/{id:long}"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateArticleWithImagesDto dto)
        {
            var e = await _db.Articles.FindAsync(id);
            if (e is null)
                return NotFound(new ApiResponse<object>(404, $"Article with id={id} not found.", null));

            using var tx = await _db.Database.BeginTransactionAsync();

            try
            {
                // cập nhật article
                e.Title = dto.Title;
                e.Slug = dto.Slug;
                e.Summary = dto.Summary;
                e.Content = dto.Content;
                e.CategoryId = dto.CategoryId;
                e.IsPublished = dto.IsPublished;
                e.PublishedAt = dto.PublishedAt;
                e.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();

                // (1) Add ảnh mới
                if (dto.AddImages is { Length: > 0 })
                {
                    var created = new List<(NewImageItem item, long mediaId)>();
                    foreach (var img in dto.AddImages)
                    {
                        var m = new Image
                        {
                            Url = img.Url,
                            AltText = img.AltText,
                            Caption = img.Caption,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = User.UserId()
                        };
                        _db.Images.Add(m);
                        await _db.SaveChangesAsync();

                        _db.ImageLinks.Add(new ImageLink
                        {
                            ImageId = m.Id,
                            TargetType = ImageOwner.Article,
                            TargetId = e.Id,
                            Position = img.Position,
                            IsCover = img.IsCover,
                            CreatedAt = DateTime.UtcNow
                        });
                        created.Add((img, m.Id));
                    }
                    await _db.SaveChangesAsync();

                    // nếu có ảnh mới đánh dấu cover và chưa set CoverImageId riêng, ưu tiên ảnh mới
                    var newCover = dto.AddImages.FirstOrDefault(x => x.IsCover);
                    if (newCover != null && dto.CoverImageId is null)
                    {
                        var mediaId = created.First(x => x.item == newCover).mediaId;
                        e.CoverImageId = mediaId;
                        await _db.SaveChangesAsync();
                    }
                }

                // (2) Attach media đã có sẵn
                if (dto.AttachMediaIds is { Length: > 0 })
                {
                    foreach (var mid in dto.AttachMediaIds.Distinct())
                    {
                        // tránh trùng link
                        var exists = await _db.ImageLinks.AnyAsync(l =>
                            l.TargetType == ImageOwner.Article && l.TargetId == e.Id && l.ImageId == mid);
                        if (exists) continue;

                        _db.ImageLinks.Add(new ImageLink
                        {
                            ImageId = mid,
                            TargetType = ImageOwner.Article,
                            TargetId = e.Id,
                            Position = 0,
                            IsCover = false,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                    await _db.SaveChangesAsync();
                }

                // (3) Remove link
                if (dto.RemoveLinkIds is { Length: > 0 })
                {
                    var links = await _db.ImageLinks
                        .Where(l => dto.RemoveLinkIds.Contains(l.Id) && l.TargetType == ImageOwner.Article && l.TargetId == e.Id)
                        .ToListAsync();

                    _db.ImageLinks.RemoveRange(links);
                    await _db.SaveChangesAsync();

                    // nếu đang xoá link của ảnh cover, bỏ cover nếu cần
                    if (e.CoverImageId.HasValue)
                    {
                        var stillHasCover = await _db.ImageLinks.AnyAsync(l =>
                            l.TargetType == ImageOwner.Article && l.TargetId == e.Id && l.ImageId == e.CoverImageId.Value);
                        if (!stillHasCover) { e.CoverImageId = null; await _db.SaveChangesAsync(); }
                    }
                }

                // (4) Reorder
                if (dto.Reorders is { Length: > 0 })
                {
                    var linkIds = dto.Reorders.Select(r => r.ImageLinkId).ToArray();
                    var links = await _db.ImageLinks
                        .Where(l => l.TargetType == ImageOwner.Article && l.TargetId == e.Id && linkIds.Contains(l.Id))
                        .ToListAsync();

                    foreach (var l in links)
                    {
                        var pos = dto.Reorders.First(r => r.ImageLinkId == l.Id).Position;
                        l.Position = pos;
                    }
                    await _db.SaveChangesAsync();
                }

                // (5) Set Cover
                if (dto.CoverImageId.HasValue)
                {
                    // chỉ set cover khi mediaId đó thực sự đang gắn với article
                    var linked = await _db.ImageLinks.AnyAsync(l =>
                        l.TargetType == ImageOwner.Article && l.TargetId == e.Id && l.ImageId == dto.CoverImageId.Value);

                    e.CoverImageId = linked ? dto.CoverImageId : null;
                    await _db.SaveChangesAsync();

                    // đồng bộ cờ IsCover trên link
                    var links = await _db.ImageLinks
                        .Where(l => l.TargetType == ImageOwner.Article && l.TargetId == e.Id)
                        .ToListAsync();

                    foreach (var l in links) l.IsCover = (l.ImageId == e.CoverImageId);
                    await _db.SaveChangesAsync();
                }

                await tx.CommitAsync();
                return Ok(new ApiResponse<object>(200, "Article updated successfully.", null));
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return StatusCode(500, new ApiResponse<object>(500, $"Failed to update article: {ex.Message}", null));
            }
        }

        // ==== DELETE ====
        [HttpDelete("articles/delete/{id:long}"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(long id)
        {
            var e = await _db.Articles.FindAsync(id);
            if (e is null)
                return NotFound(new ApiResponse<object>(404, $"Article with id={id} not found.", null));

            // Xoá link ảnh (không xoá media gốc để tránh ảnh dùng chung bị mất)
            var links = await _db.ImageLinks
                .Where(l => l.TargetType == ImageOwner.Article && l.TargetId == id)
                .ToListAsync();
            _db.ImageLinks.RemoveRange(links);

            _db.Remove(e);
            await _db.SaveChangesAsync();

            // trước là NoContent(); giờ trả 200 + message
            return Ok(new ApiResponse<object>(200, "Article deleted successfully.", null));
        }
    }
}
