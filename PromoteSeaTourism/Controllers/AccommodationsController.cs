using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PromoteSeaTourism.Controllers.Common;
using PromoteSeaTourism.Data;
using PromoteSeaTourism.DTOs;
using PromoteSeaTourism.Models;
using System.Linq;

namespace PromoteSeaTourism.Controllers
{
    // =============== DTOs (dùng ngay) ===============
    public record CreateAccommodationWithImagesDto(
        string Name, string Slug, string? Summary, string? Content,
        string? Address, string? Phone, string? Website,
        sbyte? Star, decimal? MinPrice, decimal? MaxPrice,
        long? CategoryId, bool IsPublished,
        NewImageItem[]? Images    // ảnh mới tạo kèm
    );

    public record UpdateAccommodationWithImagesDto(
        string Name, string Slug, string? Summary, string? Content,
        string? Address, string? Phone, string? Website,
        sbyte? Star, decimal? MinPrice, decimal? MaxPrice,
        long? CategoryId, bool IsPublished, DateTime CreatedAt,
        // image ops
        NewImageItem[]?   AddImages,        // thêm ảnh mới
        long[]?           AttachMediaIds,   // gắn media đã có
        long[]?           RemoveLinkIds,    // xoá link ảnh khỏi entity này
        ReorderImageItem[]? Reorders,       // sắp xếp lại Position
        long? CoverImageId                  // set cover nếu đã link
    );

    [Route("api")]
    public class AccommodationsController : AppControllerBase
    {
        public AccommodationsController(AppDbContext db) : base(db) { }

        // ================= LIST =================
        [HttpGet("accommodations/list"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> List(int page = 1, int pageSize = 20, bool? published = null)
        {
            try
            {
                var q = _db.Accommodations.AsNoTracking();
                if (published.HasValue) q = q.Where(x => x.IsPublished == published.Value);
                q = q.OrderByDescending(x => x.CreatedAt);

                var total = await q.CountAsync();

                var pageItems = await Page(q, page, pageSize)
                    .Select(a => new
                    {
                        a.Id, a.Name, a.Slug, a.Summary, a.Content,
                        a.Address, a.Phone, a.Website, a.Star, a.MinPrice, a.MaxPrice,
                        a.CoverImageId, a.CategoryId, a.IsPublished, a.CreatedAt, a.UpdatedAt
                    })
                    .ToListAsync();

                if (pageItems.Count == 0)
                    return Ok(new PagedResponse<object>(
                        200,
                        "No accommodations found.",
                        total,
                        page,
                        pageSize,
                        Array.Empty<object>()
                    ));

                // map coverId -> url
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

                // lấy ảnh đầu tiên/ảnh cover từ ImageLinks
                var ids = pageItems.Select(x => x.Id).ToArray();
                var orderedLinks = await _db.ImageLinks.AsNoTracking()
                    .Include(l => l.Image)
                    .Where(l => l.TargetType == ImageOwner.Accommodation && ids.Contains(l.TargetId))
                    .OrderBy(l => l.TargetId).ThenByDescending(l => l.IsCover).ThenBy(l => l.Position).ThenBy(l => l.Id)
                    .Select(l => new { l.TargetId, l.Image.Url })
                    .ToListAsync();

                var firstLinkUrlByAcc = new Dictionary<long, string>();
                foreach (var link in orderedLinks)
                    if (!firstLinkUrlByAcc.ContainsKey(link.TargetId))
                        firstLinkUrlByAcc[link.TargetId] = link.Url;

                var items = pageItems.Select(a =>
                {
                    string? coverUrl = (a.CoverImageId.HasValue && coverUrlMap.TryGetValue(a.CoverImageId.Value, out var cu)) ? cu : null;
                    string? thumb = coverUrl ?? (firstLinkUrlByAcc.TryGetValue(a.Id, out var fb) ? fb : null);

                    return new
                    {
                        a.Id, a.Name, a.Slug, a.Summary, a.Content,
                        a.Address, a.Phone, a.Website, a.Star, a.MinPrice, a.MaxPrice,
                        a.CoverImageId, ThumbnailUrl = thumb,
                        a.CategoryId, a.IsPublished, a.CreatedAt, a.UpdatedAt
                    };
                });

                return Ok(new PagedResponse<object>(
                    200,
                    "Success",
                    total,
                    page,
                    pageSize,
                    items
                ));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>(500, $"Internal Server Error: {ex.Message}", null));
            }
        }

        // ================= GET BY ID =================
        [HttpGet("accommodations/get/{id:long}"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<object>> Get(long id)
        {
            var a = await _db.Accommodations.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (a is null)
                return NotFound(new ApiResponse<object>(404, $"Accommodation with id={id} not found.", null));

            var gallery = await _db.ImageLinks.AsNoTracking()
                .Include(l => l.Image)
                .Where(l => l.TargetType == ImageOwner.Accommodation && l.TargetId == id)
                .OrderBy(l => l.Position).ThenBy(l => l.Id)
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
                a.Id, a.Name, a.Slug, a.Summary, a.Content,
                a.Address, a.Phone, a.Website, a.Star, a.MinPrice, a.MaxPrice,
                a.CoverImageId, a.CategoryId, a.IsPublished, a.CreatedAt, a.UpdatedAt,
                Images = gallery
            };

            return Ok(new ApiResponse<object>(200, "Success", data));
        }

        // ================= CREATE =================
        [HttpPost("accommodations/create"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<object>> Create([FromBody] CreateAccommodationWithImagesDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new ApiResponse<object>(400, "Name is required.", null));
            if (string.IsNullOrWhiteSpace(dto.Slug))
                return BadRequest(new ApiResponse<object>(400, "Slug is required.", null));

            using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                var e = new Accommodation
                {
                    Name = dto.Name,
                    Slug = dto.Slug,
                    Summary = dto.Summary,
                    Content = dto.Content,
                    Address = dto.Address,
                    Phone = dto.Phone,
                    Website = dto.Website,
                    Star = dto.Star,
                    MinPrice = dto.MinPrice,
                    MaxPrice = dto.MaxPrice,
                    CategoryId = dto.CategoryId,
                    IsPublished = dto.IsPublished,
                    CreatedAt = DateTime.UtcNow
                };
                _db.Accommodations.Add(e);
                await _db.SaveChangesAsync();

                // Images (new)
                if (dto.Images is { Length: > 0 })
                {
                    var medias = new List<Image>();
                    var uid = User.UserId();

                    foreach (var img in dto.Images)
                    {
                        var m = new Image
                        {
                            Url = img.Url,
                            AltText = img.AltText,
                            Caption = img.Caption,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = uid
                        };
                        _db.Images.Add(m);
                        medias.Add(m);
                    }
                    await _db.SaveChangesAsync();

                    foreach (var (img, idx) in dto.Images.Select((v, i) => (v, i)))
                    {
                        _db.ImageLinks.Add(new ImageLink
                        {
                            ImageId = medias[idx].Id,
                            TargetType = ImageOwner.Accommodation,
                            TargetId = e.Id,
                            Position = img.Position,
                            IsCover = img.IsCover,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                    await _db.SaveChangesAsync();

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
                    new ApiResponse<object>(201, "Accommodation created successfully.", new { id = e.Id }));
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return StatusCode(500, new ApiResponse<object>(500, $"Failed to create accommodation: {ex.Message}", null));
            }
        }

        // ================= UPDATE =================
        [HttpPut("accommodations/update/{id:long}"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateAccommodationWithImagesDto dto)
        {
            var e = await _db.Accommodations.FindAsync(id);
            if (e is null)
                return NotFound(new ApiResponse<object>(404, $"Accommodation with id={id} not found.", null));

            using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                // Core fields
                e.Name = dto.Name;
                e.Slug = dto.Slug;
                e.Summary = dto.Summary;
                e.Content = dto.Content;
                e.Address = dto.Address;
                e.Phone = dto.Phone;
                e.Website = dto.Website;
                e.Star = dto.Star;
                e.MinPrice = dto.MinPrice;
                e.MaxPrice = dto.MaxPrice;
                e.CategoryId = dto.CategoryId;
                e.IsPublished = dto.IsPublished;
                // Cho phép chỉnh CreatedAt theo DTO (đúng chữ ký DTO bạn đưa)
                e.CreatedAt = dto.CreatedAt;
                e.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();

                // (1) Add new images
                if (dto.AddImages is { Length: > 0 })
                {
                    var created = new List<(NewImageItem item, long mediaId)>();
                    var uid = User.UserId();

                    foreach (var img in dto.AddImages)
                    {
                        var m = new Image
                        {
                            Url = img.Url,
                            AltText = img.AltText,
                            Caption = img.Caption,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = uid
                        };
                        _db.Images.Add(m);
                        await _db.SaveChangesAsync();

                        _db.ImageLinks.Add(new ImageLink
                        {
                            ImageId = m.Id,
                            TargetType = ImageOwner.Accommodation,
                            TargetId = e.Id,
                            Position = img.Position,
                            IsCover = img.IsCover,
                            CreatedAt = DateTime.UtcNow
                        });
                        created.Add((img, m.Id));
                    }
                    await _db.SaveChangesAsync();

                    var newCover = dto.AddImages.FirstOrDefault(x => x.IsCover);
                    if (newCover != null && dto.CoverImageId is null)
                    {
                        var mediaId = created.First(x => x.item == newCover).mediaId;
                        e.CoverImageId = mediaId;
                        await _db.SaveChangesAsync();
                    }
                }

                // (2) Attach existing medias
                if (dto.AttachMediaIds is { Length: > 0 })
                {
                    foreach (var mid in dto.AttachMediaIds.Distinct())
                    {
                        var exists = await _db.ImageLinks.AnyAsync(l =>
                            l.TargetType == ImageOwner.Accommodation && l.TargetId == e.Id && l.ImageId == mid);
                        if (exists) continue;

                        _db.ImageLinks.Add(new ImageLink
                        {
                            ImageId = mid,
                            TargetType = ImageOwner.Accommodation,
                            TargetId = e.Id,
                            Position = 0,
                            IsCover = false,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                    await _db.SaveChangesAsync();
                }

                // (3) Remove links
                if (dto.RemoveLinkIds is { Length: > 0 })
                {
                    var links = await _db.ImageLinks
                        .Where(l => dto.RemoveLinkIds.Contains(l.Id) &&
                                    l.TargetType == ImageOwner.Accommodation &&
                                    l.TargetId == e.Id)
                        .ToListAsync();

                    _db.ImageLinks.RemoveRange(links);
                    await _db.SaveChangesAsync();

                    if (e.CoverImageId.HasValue)
                    {
                        var still = await _db.ImageLinks.AnyAsync(l =>
                            l.TargetType == ImageOwner.Accommodation &&
                            l.TargetId == e.Id &&
                            l.ImageId == e.CoverImageId.Value);
                        if (!still)
                        {
                            e.CoverImageId = null;
                            await _db.SaveChangesAsync();
                        }
                    }
                }

                // (4) Reorder positions
                if (dto.Reorders is { Length: > 0 })
                {
                    var ids = dto.Reorders.Select(r => r.ImageLinkId).ToArray();
                    var links = await _db.ImageLinks
                        .Where(l => l.TargetType == ImageOwner.Accommodation && l.TargetId == e.Id && ids.Contains(l.Id))
                        .ToListAsync();

                    foreach (var l in links)
                        l.Position = dto.Reorders.First(r => r.ImageLinkId == l.Id).Position;

                    await _db.SaveChangesAsync();
                }

                // (5) Set cover for gallery
                if (dto.CoverImageId.HasValue)
                {
                    var linked = await _db.ImageLinks.AnyAsync(l =>
                        l.TargetType == ImageOwner.Accommodation && l.TargetId == e.Id && l.ImageId == dto.CoverImageId.Value);

                    e.CoverImageId = linked ? dto.CoverImageId : null;
                    await _db.SaveChangesAsync();

                    var links = await _db.ImageLinks
                        .Where(l => l.TargetType == ImageOwner.Accommodation && l.TargetId == e.Id)
                        .ToListAsync();

                    foreach (var l in links)
                        l.IsCover = (l.ImageId == e.CoverImageId);

                    await _db.SaveChangesAsync();
                }

                await tx.CommitAsync();
                return Ok(new ApiResponse<object>(200, "Accommodation updated successfully.", null));
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return StatusCode(500, new ApiResponse<object>(500, $"Failed to update accommodation: {ex.Message}", null));
            }
        }

        // ================= DELETE =================
        [HttpDelete("accommodations/delete/{id:long}"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Delete(long id)
        {
            var e = await _db.Accommodations.FindAsync(id);
            if (e is null)
                return NotFound(new ApiResponse<object>(404, $"Accommodation with id={id} not found.", null));

            try
            {
                var links = await _db.ImageLinks
                    .Where(l => l.TargetType == ImageOwner.Accommodation && l.TargetId == id)
                    .ToListAsync();

                _db.ImageLinks.RemoveRange(links);
                _db.Accommodations.Remove(e);
                await _db.SaveChangesAsync();

                return Ok(new ApiResponse<object>(200, "Accommodation deleted successfully.", null));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>(500, $"Failed to delete accommodation: {ex.Message}", null));
            }
        }
    }
}
