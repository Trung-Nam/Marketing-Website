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
    public class ToursController : AppControllerBase
    {
        public ToursController(AppDbContext db) : base(db) { }

        // ===== LIST (public): thumbnailUrl từ ảnh cover (nếu có) hoặc ảnh đầu =====
        [HttpGet("tours/list"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> List(int page = 1, int pageSize = 20, bool? published = null)
        {
            var q = _db.Tours.AsNoTracking();
            
            if (published.HasValue) 
                q = q.Where(x => x.IsPublished == published.Value);
            
            q = q.OrderByDescending(x => x.CreatedAt);

            var total = await q.CountAsync();
            var pageItems = await Page(q, page, pageSize)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Slug,
                    t.Summary,
                    t.Description,
                    t.PriceFrom,
                    t.Itinerary,
                    t.CategoryId,
                    t.IsPublished,
                    t.CreatedAt,
                    t.UpdatedAt
                })
                .ToListAsync();

            if (!pageItems.Any())
                return Ok(new PagedResponse<object>(200, "No tours found.", total, page, pageSize, Array.Empty<object>()));

            var ids = pageItems.Select(x => x.Id).ToArray();

            // Lấy link ảnh theo thứ tự: IsCover DESC -> Position ASC -> Id ASC
            var orderedLinks = await _db.ImageLinks.AsNoTracking()
                .Include(l => l.Image)
                .Where(l => l.TargetType == ImageOwner.Tour && ids.Contains(l.TargetId))
                .OrderBy(l => l.TargetId)
                .ThenByDescending(l => l.IsCover)
                .ThenBy(l => l.Position)
                .ThenBy(l => l.Id)
                .Select(l => new { l.TargetId, l.Image.Url })
                .ToListAsync();

            var firstLinkUrlByTour = new Dictionary<long, string>();
            foreach (var link in orderedLinks)
                if (!firstLinkUrlByTour.ContainsKey(link.TargetId))
                    firstLinkUrlByTour[link.TargetId] = link.Url;

            var items = pageItems.Select(t => new
            {
                t.Id,
                t.Name,
                t.Slug,
                t.Summary,
                t.Description,
                t.PriceFrom,
                t.Itinerary,
                t.CategoryId,
                t.IsPublished,
                t.CreatedAt,
                t.UpdatedAt,
                ThumbnailUrl = firstLinkUrlByTour.TryGetValue(t.Id, out var fb) ? fb : null
            });

            return Ok(new PagedResponse<object>(200, "Success", total, page, pageSize, items));
        }

        // ===== GET BY ID (public): gallery =====
        [HttpGet("tours/get/{id:long}"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<object>> Get(long id)
        {
            var t = await _db.Tours.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (t is null)
                return NotFound(new ApiResponse<object>(404, $"Tour with id={id} not found.", null));

            var gallery = await _db.ImageLinks.AsNoTracking()
                .Include(l => l.Image)
                .Where(l => l.TargetType == ImageOwner.Tour && l.TargetId == id)
                .OrderByDescending(l => l.IsCover)
                .ThenBy(l => l.Position)
                .ThenBy(l => l.Id)
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
                t.Id,
                t.Name,
                t.Slug,
                t.Summary,
                t.Description,
                t.PriceFrom,
                t.Itinerary,
                t.CategoryId,
                t.IsPublished,
                t.CreatedAt,
                t.UpdatedAt,
                Images = gallery
            };

            return Ok(new ApiResponse<object>(200, "Success", data));
        }

        // ===== CREATE (Admin/Editor): tạo tour + thêm mới media + link ảnh =====
        [HttpPost("tours/create"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<object>> Create([FromBody] CreateTourWithImagesDto dto)
        {
            using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                var e = new Tour
                {
                    Name = dto.Name,
                    Slug = dto.Slug,
                    Summary = dto.Summary,
                    Description = dto.Description,
                    PriceFrom = dto.PriceFrom,
                    Itinerary = dto.Itinerary,
                    CategoryId = dto.CategoryId,
                    IsPublished = dto.IsPublished,
                    CreatedAt = DateTime.UtcNow
                };
                _db.Tours.Add(e);
                await _db.SaveChangesAsync();

                // Images (new only on create)
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
                        var mediaId = medias[idx].Id;
                        _db.ImageLinks.Add(new ImageLink
                        {
                            ImageId = mediaId,
                            TargetType = ImageOwner.Tour,
                            TargetId = e.Id,
                            Position = img.Position,
                            IsCover = img.IsCover,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                    await _db.SaveChangesAsync();
                }

                // Attach existing media ids (nếu có)
                if (dto.AttachMediaIds is { Length: > 0 })
                {
                    foreach (var mid in dto.AttachMediaIds.Distinct())
                    {
                        var exists = await _db.ImageLinks.AnyAsync(l =>
                            l.TargetType == ImageOwner.Tour && l.TargetId == e.Id && l.ImageId == mid);
                        if (exists) continue;

                        _db.ImageLinks.Add(new ImageLink
                        {
                            ImageId = mid,
                            TargetType = ImageOwner.Tour,
                            TargetId = e.Id,
                            Position = 0,
                            IsCover = false,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                    await _db.SaveChangesAsync();
                }

                // Set cover (nếu client truyền vào mediaId)
                if (dto.CoverImageId.HasValue)
                {
                    var links = await _db.ImageLinks
                        .Where(l => l.TargetType == ImageOwner.Tour && l.TargetId == e.Id)
                        .ToListAsync();

                    foreach (var l in links)
                        l.IsCover = (l.ImageId == dto.CoverImageId.Value);

                    await _db.SaveChangesAsync();
                }

                await tx.CommitAsync();
                return CreatedAtAction(nameof(Get), new { id = e.Id },
                    new ApiResponse<object>(201, "Tour created successfully.", new { id = e.Id }));
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return StatusCode(500, new ApiResponse<object>(500, $"Failed to create tour: {ex.Message}", null));
            }
        }

        // ===== UPDATE (Admin/Editor): cập nhật tour + thao tác ảnh (không động tới itinerary days/stops) =====
        [HttpPut("tours/update/{id:long}"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateTourWithImagesDto dto)
        {
            var e = await _db.Tours.FindAsync(id);
            if (e is null)
                return NotFound(new ApiResponse<object>(404, $"Tour with id={id} not found.", null));

            using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                e.Name = dto.Name;
                e.Slug = dto.Slug;
                e.Summary = dto.Summary;
                e.Description = dto.Description;
                e.PriceFrom = dto.PriceFrom;
                e.Itinerary = dto.Itinerary;
                e.CategoryId = dto.CategoryId;
                e.IsPublished = dto.IsPublished;
                e.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();

                // (1) Add new images
                if (dto.AddImages is { Length: > 0 })
                {
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
                            TargetType = ImageOwner.Tour,
                            TargetId = e.Id,
                            Position = img.Position,
                            IsCover = img.IsCover,
                            CreatedAt = DateTime.UtcNow
                        });
                        await _db.SaveChangesAsync();
                    }
                }

                // (2) Attach existing medias
                if (dto.AttachMediaIds is { Length: > 0 })
                {
                    foreach (var mid in dto.AttachMediaIds.Distinct())
                    {
                        var exists = await _db.ImageLinks.AnyAsync(l =>
                            l.TargetType == ImageOwner.Tour && l.TargetId == e.Id && l.ImageId == mid);
                        if (exists) continue;

                        _db.ImageLinks.Add(new ImageLink
                        {
                            ImageId = mid,
                            TargetType = ImageOwner.Tour,
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
                        .Where(l => dto.RemoveLinkIds.Contains(l.Id) && l.TargetType == ImageOwner.Tour && l.TargetId == e.Id)
                        .ToListAsync();
                    _db.ImageLinks.RemoveRange(links);
                    await _db.SaveChangesAsync();
                }

                // (4) Reorder positions
                if (dto.Reorders is { Length: > 0 })
                {
                    var ids = dto.Reorders.Select(r => r.ImageLinkId).ToArray();
                    var links = await _db.ImageLinks
                        .Where(l => l.TargetType == ImageOwner.Tour && l.TargetId == e.Id && ids.Contains(l.Id))
                        .ToListAsync();
                    foreach (var l in links)
                        l.Position = dto.Reorders.First(r => r.ImageLinkId == l.Id).Position;
                    await _db.SaveChangesAsync();
                }

                // (5) Set cover cho gallery (không lưu trong Tour)
                if (dto.CoverImageId.HasValue)
                {
                    var links = await _db.ImageLinks
                        .Where(l => l.TargetType == ImageOwner.Tour && l.TargetId == e.Id)
                        .ToListAsync();
                    foreach (var l in links) l.IsCover = (l.ImageId == dto.CoverImageId.Value);
                    await _db.SaveChangesAsync();
                }

                await tx.CommitAsync();
                return Ok(new ApiResponse<object>(200, "Tour updated successfully.", null));
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return StatusCode(500, new ApiResponse<object>(500, $"Failed to update tour: {ex.Message}", null));
            }
        }

        // ===== DELETE (Admin/Editor) =====
        [HttpDelete("tours/delete/{id:long}"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(long id)
        {
            var e = await _db.Tours.FindAsync(id);
            if (e is null)
                return NotFound(new ApiResponse<object>(404, $"Tour with id={id} not found.", null));

            var links = await _db.ImageLinks.Where(l => l.TargetType == ImageOwner.Tour && l.TargetId == id).ToListAsync();
            _db.ImageLinks.RemoveRange(links);

            _db.Remove(e);
            await _db.SaveChangesAsync();

            return Ok(new ApiResponse<object>(200, "Tour deleted successfully.", null));
        }
    }
}
