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
    public class FavoritesController : AppControllerBase
    {
        public FavoritesController(AppDbContext db) : base(db) { }

        // ===== LIST MINE =====
        [HttpGet("favorites/list"), Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> ListMine()
        {
            var uid = User.UserId()!.Value;

            var favorites = await _db.Favorites
                .AsNoTracking()
                .Where(x => x.UserId == uid)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            if (!favorites.Any())
                return Ok(new ApiResponse<object>(200, "No favorites found.", Array.Empty<object>()));

            var result = new List<object>();

            foreach (var fav in favorites)
            {
                object? item = null;

                switch (fav.TargetType)
                {
                    case ContentTarget.Category:
                    {
                        var c = await _db.Categories.AsNoTracking()
                            .FirstOrDefaultAsync(x => x.Id == fav.TargetId);
                        if (c is null) break;

                        item = new
                        {
                            c.Id, c.Name, c.Slug, c.Type,
                            ContentType = "Category"
                        };
                        break;
                    }
                    case ContentTarget.Article:
                    {
                        var a = await _db.Articles.AsNoTracking()
                            .Include(x => x.Category)
                            .FirstOrDefaultAsync(x => x.Id == fav.TargetId);
                        if (a is null) break;

                        var gallery = await _db.ImageLinks.AsNoTracking()
                            .Include(l => l.Image)
                            .Where(l => l.TargetType == ImageOwner.Article && l.TargetId == a.Id)
                            .OrderByDescending(l => l.IsCover).ThenBy(l => l.Position).ThenBy(l => l.Id)
                            .Select(l => new { LinkId = l.Id, MediaId = l.ImageId, l.IsCover, l.Position, l.Image.Url, l.Image.AltText, l.Image.Caption })
                            .ToListAsync();

                        var category = a.CategoryId.HasValue
                            ? await _db.Categories.AsNoTracking().Where(c => c.Id == a.CategoryId.Value).Select(c => new { c.Id, c.Name, c.Slug }).FirstOrDefaultAsync()
                            : null;

                        item = new
                        {
                            a.Id, a.Title, a.Slug, a.Summary,
                            a.IsPublished, a.PublishedAt, a.CreatedAt, a.UpdatedAt,
                            Category = category,
                            Images = gallery,
                            Type = "Article"
                        };
                        break;
                    }

                    case ContentTarget.Event:
                    {
                        var e = await _db.Events.AsNoTracking()
                            .FirstOrDefaultAsync(x => x.Id == fav.TargetId);
                        if (e is null) break;

                        var gallery = await _db.ImageLinks.AsNoTracking()
                            .Include(l => l.Image)
                            .Where(l => l.TargetType == ImageOwner.Event && l.TargetId == e.Id)
                            .OrderByDescending(l => l.IsCover).ThenBy(l => l.Position).ThenBy(l => l.Id)
                            .Select(l => new { LinkId = l.Id, MediaId = l.ImageId, l.IsCover, l.Position, l.Image.Url, l.Image.AltText, l.Image.Caption })
                            .ToListAsync();

                        var category = e.CategoryId > 0
                            ? await _db.Categories.AsNoTracking().Where(c => c.Id == e.CategoryId).Select(c => new { c.Id, c.Name, c.Slug }).FirstOrDefaultAsync()
                            : null;
                        var place = e.PlaceId > 0
                            ? await _db.Places.AsNoTracking().Where(p => p.Id == e.PlaceId).Select(p => new { p.Id, p.Name, p.Slug }).FirstOrDefaultAsync()
                            : null;

                        item = new
                        {
                            e.Id, e.Title, e.Slug, e.Summary,
                            e.StartTime, e.EndTime, e.Address, e.PriceInfo,
                            e.IsPublished, e.CreatedAt, e.UpdatedAt,
                            Category = category,
                            Place = place,
                            Images = gallery,
                            Type = "Event"
                        };
                        break;
                    }

                    case ContentTarget.Tour:
                    {
                        var t = await _db.Tours.AsNoTracking()
                            .FirstOrDefaultAsync(x => x.Id == fav.TargetId);
                        if (t is null) break;

                        var gallery = await _db.ImageLinks.AsNoTracking()
                            .Include(l => l.Image)
                            .Where(l => l.TargetType == ImageOwner.Tour && l.TargetId == t.Id)
                            .OrderByDescending(l => l.IsCover).ThenBy(l => l.Position).ThenBy(l => l.Id)
                            .Select(l => new { LinkId = l.Id, MediaId = l.ImageId, l.IsCover, l.Position, l.Image.Url, l.Image.AltText, l.Image.Caption })
                            .ToListAsync();

                        var category = t.CategoryId > 0
                            ? await _db.Categories.AsNoTracking().Where(c => c.Id == t.CategoryId).Select(c => new { c.Id, c.Name, c.Slug }).FirstOrDefaultAsync()
                            : null;

                        item = new
                        {
                            t.Id, t.Name, t.Slug, t.Summary, t.Description, t.PriceFrom, t.Itinerary,
                            t.CreatedAt,
                            Category = category,
                            Images = gallery,
                            Type = "Tour"
                        };
                        break;
                    }

                    case ContentTarget.Place:
                    {
                        var p = await _db.Places.AsNoTracking()
                            .FirstOrDefaultAsync(x => x.Id == fav.TargetId);
                        if (p is null) break;

                        var category = p.CategoryId.HasValue
                            ? await _db.Categories.AsNoTracking().Where(c => c.Id == p.CategoryId.Value).Select(c => new { c.Id, c.Name, c.Slug }).FirstOrDefaultAsync()
                            : null;

                        object? coverImage = null;
                        if (p.CoverImageId.HasValue)
                        {
                            var img = await _db.Images.AsNoTracking().FirstOrDefaultAsync(i => i.Id == p.CoverImageId.Value);
                            if (img != null)
                            {
                                coverImage = new { Id = img.Id, img.Url, img.AltText, img.Caption };
                            }
                        }

                        item = new
                        {
                            p.Id, p.Name, p.Slug, p.Summary, p.Content, p.Address,
                            p.CreatedAt, p.UpdatedAt,
                            Category = category,
                            CoverImage = coverImage,
                            Type = "Place"
                        };
                        break;
                    }

                    case ContentTarget.Accommodation:
                    {
                        var a = await _db.Accommodations.AsNoTracking()
                            .FirstOrDefaultAsync(x => x.Id == fav.TargetId);
                        if (a is null) break;

                        var gallery = await _db.ImageLinks.AsNoTracking()
                            .Include(l => l.Image)
                            .Where(l => l.TargetType == ImageOwner.Accommodation && l.TargetId == a.Id)
                            .OrderByDescending(l => l.IsCover).ThenBy(l => l.Position).ThenBy(l => l.Id)
                            .Select(l => new { LinkId = l.Id, MediaId = l.ImageId, l.IsCover, l.Position, l.Image.Url, l.Image.AltText, l.Image.Caption })
                            .ToListAsync();

                        var category = a.CategoryId.HasValue
                            ? await _db.Categories.AsNoTracking().Where(c => c.Id == a.CategoryId.Value).Select(c => new { c.Id, c.Name, c.Slug }).FirstOrDefaultAsync()
                            : null;

                        item = new
                        {
                            a.Id, a.Name, a.Slug, a.Summary, a.Content,
                            a.Address, a.Phone, a.Website, a.Star,
                            a.IsPublished, a.CreatedAt, a.UpdatedAt,
                            Category = category,
                            Images = gallery,
                            Type = "Accommodation"
                        };
                        break;
                    }

                    case ContentTarget.Restaurant:
                    {
                        var r = await _db.Restaurants.AsNoTracking()
                            .FirstOrDefaultAsync(x => x.Id == fav.TargetId);
                        if (r is null) break;

                        var gallery = await _db.ImageLinks.AsNoTracking()
                            .Include(l => l.Image)
                            .Where(l => l.TargetType == ImageOwner.Restaurant && l.TargetId == r.Id)
                            .OrderByDescending(l => l.IsCover).ThenBy(l => l.Position).ThenBy(l => l.Id)
                            .Select(l => new { LinkId = l.Id, MediaId = l.ImageId, l.IsCover, l.Position, l.Image.Url, l.Image.AltText, l.Image.Caption })
                            .ToListAsync();

                        var category = r.CategoryId.HasValue
                            ? await _db.Categories.AsNoTracking().Where(c => c.Id == r.CategoryId.Value).Select(c => new { c.Id, c.Name, c.Slug }).FirstOrDefaultAsync()
                            : null;

                        item = new
                        {
                            r.Id, r.Name, r.Slug, r.Summary, r.Content,
                            r.Address, r.Phone, r.Website, r.PriceRangeText,
                            r.IsPublished, r.CreatedAt, r.UpdatedAt,
                            Category = category,
                            Images = gallery,
                            Type = "Restaurant"
                        };
                        break;
                    }
                }

                if (item != null)
                {
                    result.Add(new
                    {
                        FavoriteId = new { fav.UserId, fav.TargetType, fav.TargetId },
                        fav.CreatedAt,
                        Item = item
                    });
                }
            }

            return Ok(new ApiResponse<object>(200, "Success", result));
        }

        // ===== UPSERT (ADD IF NOT EXISTS) =====
        [HttpPost("favorites/create"), Authorize]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> Upsert([FromBody] UpsertFavoriteDto dto)
        {
            var uid = User.UserId()!.Value;
            if (string.IsNullOrWhiteSpace(dto.TargetType))
                return BadRequest(new ApiResponse<object>(400, "targetType is required", null));

            if (!Enum.TryParse<ContentTarget>(dto.TargetType, ignoreCase: true, out var targetType))
                return BadRequest(new ApiResponse<object>(400, "Invalid targetType", null));

            var exists = await _db.Favorites.FindAsync(uid, targetType, dto.TargetId);
            if (exists is null)
            {
                var entity = new Favorite
                {
                    UserId = uid,
                    TargetType = targetType,
                    TargetId = dto.TargetId,
                    CreatedAt = DateTime.UtcNow
                };

                _db.Favorites.Add(entity);
                await _db.SaveChangesAsync();

                // 201 Created với payload chuẩn
                return CreatedAtAction(nameof(ListMine), null,
                    new ApiResponse<object>(201, "Favorite added.", new
                    {
                        targetType = targetType.ToString(),
                        targetId = dto.TargetId
                    }));
            }

            // Đã tồn tại: trả 200 với message (thay cho 204 NoContent để có body)
            return Ok(new ApiResponse<object>(200, "Favorite already exists. No changes made.", null));
        }

        // ===== CHECK IF FAVORITE =====
        [HttpGet("favorites/check"), Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> Check([FromQuery] string targetType, [FromQuery] long targetId)
        {
            var uid = User.UserId()!.Value;

            if (!Enum.TryParse<ContentTarget>(targetType, ignoreCase: true, out var parsed))
                return BadRequest(new ApiResponse<object>(400, "Invalid targetType", null));

            var exists = await _db.Favorites
                .AsNoTracking()
                .AnyAsync(f => f.UserId == uid && f.TargetType == parsed && f.TargetId == targetId);

            return Ok(new ApiResponse<object>(200, "Success", new { isFavorite = exists }));
        }

        // ===== REMOVE =====
        [HttpDelete("favorites/delete"), Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Remove([FromQuery] string targetType, [FromQuery] long targetId)
        {
            var uid = User.UserId()!.Value;

            if (!Enum.TryParse<ContentTarget>(targetType, ignoreCase: true, out var parsed))
                return BadRequest(new ApiResponse<object>(400, "Invalid targetType", null));

            var f = await _db.Favorites.FindAsync(uid, parsed, targetId);
            if (f is null)
                return NotFound(new ApiResponse<object>(404, "Favorite not found.", null));

            _db.Remove(f);
            await _db.SaveChangesAsync();

            return Ok(new ApiResponse<object>(200, "Favorite removed successfully.", null));
        }
    }
}
