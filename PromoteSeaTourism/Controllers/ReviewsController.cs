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
    public class ReviewsController : AppControllerBase
    {
        public ReviewsController(AppDbContext db) : base(db) { }

        // ==== LIST: trả kèm gallery + user {id, name} ====
        [HttpGet("reviews/list"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> List(
            ContentTarget? targetType = null,
            long? targetId = null,
            int page = 1,
            int pageSize = 20)
        {
            IQueryable<Review> q = _db.Reviews.AsNoTracking();
            if (targetType.HasValue) q = q.Where(x => x.TargetType == targetType);
            if (targetId.HasValue)   q = q.Where(x => x.TargetId == targetId);
            q = q.OrderByDescending(x => x.CreatedAt);

            var total = await q.CountAsync();

            var pageItems = await Page(q, page, pageSize).ToListAsync();
            if (!pageItems.Any())
                return Ok(new PagedResponse<object>(200, "No reviews found.", total, page, pageSize, Array.Empty<object>()));

            var reviewIds = pageItems.Select(r => r.Id).ToArray();
            var userIds   = pageItems.Select(r => r.UserId).Distinct().ToArray();

            // Map userId -> name
            var userMap = await _db.Users.AsNoTracking()
                .Where(u => userIds.Contains(u.Id))
                .Select(u => new { u.Id, u.Name })
                .ToDictionaryAsync(x => x.Id, x => x.Name);

            // Lấy ảnh theo review ids
            var links = await _db.ImageLinks.AsNoTracking()
                .Include(l => l.Image)
                .Where(l => l.TargetType == ImageOwner.Review && reviewIds.Contains(l.TargetId))
                .OrderBy(l => l.TargetId).ThenByDescending(l => l.IsCover).ThenBy(l => l.Position).ThenBy(l => l.Id)
                .Select(l => new {
                    l.TargetId,
                    LinkId  = l.Id,
                    MediaId = l.ImageId,
                    l.IsCover,
                    l.Position,
                    l.Image.Url,
                    l.Image.AltText,
                    l.Image.Caption
                })
                .ToListAsync();

            var galleryByReview = links
                .GroupBy(x => x.TargetId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var items = pageItems.Select(r => new
            {
                r.Id,
                r.TargetType,
                r.TargetId,
                r.Rating,
                r.Title,
                r.Content,
                r.CreatedAt,
                r.UpdatedAt,
                user = new { id = r.UserId, name = (userMap.TryGetValue(r.UserId, out var n) ? n : string.Empty) },
                images = galleryByReview.TryGetValue(r.Id, out var imgs)
                    ? imgs.Select(i => (object)new {
                        i.LinkId, i.MediaId, i.IsCover, i.Position, i.Url, i.AltText, i.Caption
                      })
                    : Enumerable.Empty<object>()
            });

            return Ok(new PagedResponse<object>(200, "Success", total, page, pageSize, items));
        }

        // ==== MY: trả kèm gallery + user {id, name} ====
        [HttpGet("reviews/my"), Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> My()
        {
            var uid = User.UserId()!.Value;

            var my = await _db.Reviews.AsNoTracking()
                        .Where(x => x.UserId == uid)
                        .OrderByDescending(x => x.CreatedAt)
                        .ToListAsync();

            if (!my.Any())
                return Ok(new ApiResponse<IEnumerable<object>>(200, "No reviews found.", Array.Empty<object>()));

            var reviewIds = my.Select(r => r.Id).ToArray();

            // Lấy name của current user
            var meName = await _db.Users.AsNoTracking()
                            .Where(u => u.Id == uid)
                            .Select(u => u.Name)
                            .FirstOrDefaultAsync() ?? string.Empty;

            var links = await _db.ImageLinks.AsNoTracking()
                .Include(l => l.Image)
                .Where(l => l.TargetType == ImageOwner.Review && reviewIds.Contains(l.TargetId))
                .OrderBy(l => l.TargetId).ThenByDescending(l => l.IsCover).ThenBy(l => l.Position).ThenBy(l => l.Id)
                .Select(l => new {
                    l.TargetId,
                    LinkId  = l.Id,
                    MediaId = l.ImageId,
                    l.IsCover,
                    l.Position,
                    l.Image.Url,
                    l.Image.AltText,
                    l.Image.Caption
                })
                .ToListAsync();

            var galleryByReview = links
                .GroupBy(x => x.TargetId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var items = my.Select(r => new
            {
                r.Id,
                r.TargetType,
                r.TargetId,
                r.Rating,
                r.Title,
                r.Content,
                r.CreatedAt,
                r.UpdatedAt,
                user = new { id = r.UserId, name = meName },
                images = galleryByReview.TryGetValue(r.Id, out var imgs)
                    ? imgs.Select(i => (object)new {
                        i.LinkId, i.MediaId, i.IsCover, i.Position, i.Url, i.AltText, i.Caption
                      })
                    : Enumerable.Empty<object>()
            });

            return Ok(new ApiResponse<IEnumerable<object>>(200, "Success", items));
        }

        // ==== CREATE one-step: review + images ====
        [HttpPost("reviews/create"), Authorize]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<object>> Create([FromBody] CreateReviewWithImagesDto dto)
        {
            var uid = User.UserId(); if (uid is null) return Forbid();

            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest(new ApiResponse<object>(400, "Rating must be 1..5", null));

            using var tx = await _db.Database.BeginTransactionAsync();

            var r = new Review
            {
                UserId = uid.Value,
                TargetType = dto.TargetType,
                TargetId = dto.TargetId,
                Rating = dto.Rating,
                Title = dto.Title,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };
            _db.Reviews.Add(r);
            await _db.SaveChangesAsync();

            if (dto.Images is { Length: > 0 })
            {
                var medias = new List<Image>();
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
                        TargetType = ImageOwner.Review,
                        TargetId = r.Id,
                        Position = img.Position,
                        IsCover = img.IsCover,
                        CreatedAt = DateTime.UtcNow
                    });
                }
                await _db.SaveChangesAsync();
            }

            await tx.CommitAsync();

            var user = await _db.Users.AsNoTracking()
                          .Where(u => u.Id == r.UserId)
                          .Select(u => new { id = u.Id, name = u.Name })
                          .FirstAsync();

            var gallery = await _db.ImageLinks.AsNoTracking()
                .Include(l => l.Image)
                .Where(l => l.TargetType == ImageOwner.Review && l.TargetId == r.Id)
                .OrderBy(l => l.Position)
                .Select(l => new {
                    LinkId  = l.Id,
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
                r.Id,
                r.TargetType,
                r.TargetId,
                r.Rating,
                r.Title,
                r.Content,
                r.CreatedAt,
                r.UpdatedAt,
                user,                                   // { id, name }
                images = gallery.Select(i => (object)i)
            };

            return CreatedAtAction(nameof(My), null,
                new ApiResponse<object>(201, "Review created successfully.", data));
        }

        // ==== UPDATE (không đụng ảnh) ====
        [HttpPut("reviews/update/{id:long}"), Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateReviewDto dto)
        {
            var uid = User.UserId(); if (uid is null) return Forbid();

            var r = await _db.Reviews.FindAsync(id);
            if (r is null)
                return NotFound(new ApiResponse<object>(404, $"Review with id={id} not found.", null));

            if (r.UserId != uid && !User.IsInRole(UserRole.Admin))
                return Forbid();

            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest(new ApiResponse<object>(400, "Rating must be 1..5", null));

            r.Rating = dto.Rating;
            r.Title = dto.Title;
            r.Content = dto.Content;
            r.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new ApiResponse<object>(200, "Review updated successfully.", null));
        }

        // ==== DELETE ====
        [HttpDelete("reviews/delete/{id:long}"), Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(long id)
        {
            var uid = User.UserId(); if (uid is null) return Forbid();

            var r = await _db.Reviews.FindAsync(id);
            if (r is null)
                return NotFound(new ApiResponse<object>(404, $"Review with id={id} not found.", null));

            if (r.UserId != uid && !User.IsInRole(UserRole.Admin))
                return Forbid();

            var links = await _db.ImageLinks
                .Where(l => l.TargetType == ImageOwner.Review && l.TargetId == id)
                .ToListAsync();
            _db.ImageLinks.RemoveRange(links);

            _db.Remove(r);
            await _db.SaveChangesAsync();

            return Ok(new ApiResponse<object>(200, "Review deleted successfully.", null));
        }
    }
}
