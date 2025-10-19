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
    public class EventsController : AppControllerBase
    {
        public EventsController(AppDbContext db) : base(db) { }

        // ===== LIST (public) =====
        [HttpGet("events/list"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> List(int page = 1, int pageSize = 20, bool? published = null)
        {
            var q = _db.Events.AsNoTracking();

            if (published.HasValue)
                q = q.Where(x => x.IsPublished == published.Value);

            q = q.OrderByDescending(x => x.StartTime);

            var total = await q.CountAsync();

            var pageItems = await Page(q, page, pageSize)
                .Select(e => new
                {
                    e.Id,
                    e.Title,
                    e.Slug,
                    e.Summary,
                    e.StartTime,
                    e.EndTime,
                    e.Address,
                    e.PriceInfo,
                    e.CategoryId,
                    e.PlaceId,
                    e.IsPublished,
                    e.CoverImageId,
                    e.CreatedAt
                })
                .ToListAsync();

            if (!pageItems.Any())
                return Ok(new PagedResponse<object>(200, "No events found.", total, page, pageSize, Array.Empty<object>()));

            var coverIds = pageItems
                .Where(x => x.CoverImageId.HasValue)
                .Select(x => x.CoverImageId!.Value)
                .Distinct()
                .ToArray();

            var coverMap = coverIds.Length == 0
                ? new Dictionary<long, string>()
                : await _db.Images.AsNoTracking()
                    .Where(m => coverIds.Contains(m.Id))
                    .Select(m => new { m.Id, m.Url })
                    .ToDictionaryAsync(x => x.Id, x => x.Url);

            var eventIds = pageItems.Select(x => x.Id).ToArray();

            var galleryMap = await _db.ImageLinks.AsNoTracking()
                .Include(l => l.Image)
                .Where(l => l.TargetType == ImageOwner.Event && eventIds.Contains(l.TargetId))
                .OrderBy(l => l.TargetId).ThenByDescending(l => l.IsCover).ThenBy(l => l.Position)
                .Select(l => new { l.TargetId, l.Image.Url })
                .ToListAsync();

            var thumbByEvent = new Dictionary<long, string>();
            foreach (var g in galleryMap)
                if (!thumbByEvent.ContainsKey(g.TargetId))
                    thumbByEvent[g.TargetId] = g.Url;

            var items = pageItems.Select(e =>
            {
                string? thumb = (e.CoverImageId.HasValue && coverMap.TryGetValue(e.CoverImageId.Value, out var u))
                    ? u
                    : (thumbByEvent.TryGetValue(e.Id, out var f) ? f : null);

                return new
                {
                    e.Id,
                    e.Title,
                    e.Slug,
                    e.Summary,
                    e.StartTime,
                    e.EndTime,
                    e.Address,
                    e.PriceInfo,
                    e.CategoryId,
                    e.PlaceId,
                    e.IsPublished,
                    e.CreatedAt,
                    ThumbnailUrl = thumb
                };
            });

            return Ok(new PagedResponse<object>(200, "Success", total, page, pageSize, items));
        }

        // ===== GET DETAIL (public) =====
        [HttpGet("events/get/{id:long}"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<object>> Get(long id)
        {
            var e = await _db.Events.AsNoTracking()
                .Include(ev => ev.Category)
                .Include(ev => ev.Place)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (e == null)
                return NotFound(new ApiResponse<object>(404, $"Event with id={id} not found.", null));

            var gallery = await _db.ImageLinks.AsNoTracking()
                .Include(l => l.Image)
                .Where(l => l.TargetType == ImageOwner.Event && l.TargetId == id)
                .OrderByDescending(l => l.IsCover)
                .ThenBy(l => l.Position)
                .Select(l => new
                {
                    LinkId = l.Id,
                    MediaId = l.ImageId,
                    l.Image.Url,
                    l.Image.Caption,
                    l.Image.AltText,
                    l.IsCover,
                    l.Position
                })
                .ToListAsync();

            // Tính ThumbnailUrl giống như List API
            string? thumbnailUrl = null;
            
            // Ưu tiên CoverImageId
            if (e.CoverImageId.HasValue)
            {
                var coverImage = await _db.Images.AsNoTracking()
                    .FirstOrDefaultAsync(img => img.Id == e.CoverImageId.Value);
                if (coverImage != null)
                    thumbnailUrl = coverImage.Url;
            }
            
            // Fallback: lấy ảnh đầu tiên trong gallery
            if (thumbnailUrl == null && gallery.Count > 0)
            {
                var firstImage = gallery.OrderByDescending(img => img.IsCover)
                                       .ThenBy(img => img.Position)
                                       .FirstOrDefault();
                if (firstImage != null)
                    thumbnailUrl = firstImage.Url;
            }

            var data = new
            {
                e.Id,
                e.Title,
                e.Slug,
                e.Summary,
                e.Content,
                e.StartTime,
                e.EndTime,
                e.Address,
                e.PriceInfo,
                e.CategoryId,
                e.PlaceId,
                e.CoverImageId,
                ThumbnailUrl = thumbnailUrl,  // Thêm ThumbnailUrl
                Category = e.Category == null ? null : new { e.Category.Id, e.Category.Name },
                Place = e.Place == null ? null : new { e.Place.Id, e.Place.Name },
                e.IsPublished,
                e.CreatedAt,
                e.UpdatedAt,
                Images = gallery
            };

            return Ok(new ApiResponse<object>(200, "Success", data));
        }

        // ===== CREATE =====
        [HttpPost("events/create"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<object>> Create([FromBody] CreateEventWithImagesDto dto)
        {
            using var tx = await _db.Database.BeginTransactionAsync();

            try
            {
                var e = new Event
                {
                    Title = dto.Title,
                    Slug = dto.Slug,
                    Summary = dto.Summary,
                    Content = dto.Content,
                    Address = dto.Address,
                    StartTime = dto.StartTime,
                    EndTime = dto.EndTime,
                    PriceInfo = dto.PriceInfo,
                    CategoryId = dto.CategoryId,
                    PlaceId = dto.PlaceId,
                    IsPublished = dto.IsPublished,
                    CreatedAt = DateTime.UtcNow
                };

                _db.Events.Add(e);
                await _db.SaveChangesAsync();

                // Gắn ảnh mới
                if (dto.Images is { Length: > 0 })
                {
                    var uid = User.UserId();
                    var media = new List<Image>();
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
                        media.Add(m);
                    }
                    await _db.SaveChangesAsync();

                    foreach (var (img, idx) in dto.Images.Select((v, i) => (v, i)))
                    {
                        _db.ImageLinks.Add(new ImageLink
                        {
                            ImageId = media[idx].Id,
                            TargetType = ImageOwner.Event,
                            TargetId = e.Id,
                            Position = img.Position,
                            IsCover = img.IsCover,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                    await _db.SaveChangesAsync();
                }

                await tx.CommitAsync();
                return CreatedAtAction(nameof(Get), new { id = e.Id },
                    new ApiResponse<object>(201, "Event created successfully.", new { id = e.Id }));
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return StatusCode(500, new ApiResponse<object>(500, $"Failed to create event: {ex.Message}", null));
            }
        }

        // ===== UPDATE =====
        [HttpPut("events/update/{id:long}"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateEventWithImagesDto dto)
        {
            var e = await _db.Events.FindAsync(id);
            if (e == null)
                return NotFound(new ApiResponse<object>(404, $"Event with id={id} not found.", null));

            using var tx = await _db.Database.BeginTransactionAsync();

            try
            {
                e.Title = dto.Title;
                e.Slug = dto.Slug;
                e.Summary = dto.Summary;
                e.Content = dto.Content;
                e.Address = dto.Address;
                e.StartTime = dto.StartTime;
                e.EndTime = dto.EndTime;
                e.PriceInfo = dto.PriceInfo;
                e.CategoryId = dto.CategoryId;
                e.PlaceId = dto.PlaceId;
                e.IsPublished = dto.IsPublished;
                e.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();

                // Quản lý ảnh
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
                            TargetType = ImageOwner.Event,
                            TargetId = e.Id,
                            Position = img.Position,
                            IsCover = img.IsCover,
                            CreatedAt = DateTime.UtcNow
                        });
                        await _db.SaveChangesAsync();
                    }
                }

                if (dto.RemoveLinkIds is { Length: > 0 })
                {
                    var links = await _db.ImageLinks
                        .Where(l => dto.RemoveLinkIds.Contains(l.Id) &&
                                    l.TargetType == ImageOwner.Event && l.TargetId == e.Id)
                        .ToListAsync();
                    _db.ImageLinks.RemoveRange(links);
                    await _db.SaveChangesAsync();
                }

                await tx.CommitAsync();
                return Ok(new ApiResponse<object>(200, "Event updated successfully.", null));
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return StatusCode(500, new ApiResponse<object>(500, $"Failed to update event: {ex.Message}", null));
            }
        }

        // ===== DELETE =====
        [HttpDelete("events/delete/{id:long}"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(long id)
        {
            var e = await _db.Events.FindAsync(id);
            if (e == null)
                return NotFound(new ApiResponse<object>(404, $"Event with id={id} not found.", null));

            var links = await _db.ImageLinks
                .Where(l => l.TargetType == ImageOwner.Event && l.TargetId == id)
                .ToListAsync();
            _db.ImageLinks.RemoveRange(links);

            _db.Events.Remove(e);
            await _db.SaveChangesAsync();

            return Ok(new ApiResponse<object>(200, "Event deleted successfully.", null));
        }
    }
}
