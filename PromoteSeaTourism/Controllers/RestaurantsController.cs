using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PromoteSeaTourism.Controllers.Common;
using PromoteSeaTourism.Data;
using PromoteSeaTourism.DTOs;
using PromoteSeaTourism.Models;

namespace PromoteSeaTourism.Controllers
{
    // DTOs one-step (nếu bạn đã có thì dùng lại; nếu chưa có thì dùng hai record này)
    public record CreateRestaurantWithImagesDto(
        string Name, string Slug, string? Summary, string? Content,
        string? Address, string? Phone, string? Website, string? PriceRangeText,
        long? CategoryId, bool IsPublished,
        NewImageItem[]? Images
    );

    public record UpdateRestaurantWithImagesDto(
        string Name, string Slug, string? Summary, string? Content,
        string? Address, string? Phone, string? Website, string? PriceRangeText,
        long? CategoryId, bool IsPublished, DateTime CreatedAt,
        NewImageItem[]? AddImages, long[]? AttachMediaIds, long[]? RemoveLinkIds,
        ReorderImageItem[]? Reorders, long? CoverImageId
    );

    [Route("api")]
    public class RestaurantsController : AppControllerBase
    {
        public RestaurantsController(AppDbContext db) : base(db) { }

        // ==== LIST: trả kèm thumbnailUrl ====
        [HttpGet("restaurants/list"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> List(int page = 1, int pageSize = 20, bool? published = null)
        {
            var q = _db.Restaurants.AsNoTracking();
            if (published.HasValue) q = q.Where(x => x.IsPublished == published.Value);
            q = q.OrderByDescending(x => x.CreatedAt);

            var total = await q.CountAsync();
            var pageItems = await Page(q, page, pageSize)
                .Select(r => new {
                    r.Id, r.Name, r.Slug, r.Summary, r.Content,
                    r.Address, r.Phone, r.Website, r.PriceRangeText,
                    r.CoverImageId, r.CategoryId, r.IsPublished, r.CreatedAt, r.UpdatedAt
                })
                .ToListAsync();

            if (pageItems.Count == 0)
                return Ok(new PagedResponse<object>(200, "No restaurants found.", total, page, pageSize, Array.Empty<object>()));

            var coverIds = pageItems.Where(x => x.CoverImageId.HasValue).Select(x => x.CoverImageId!.Value).Distinct().ToArray();
            var coverUrlMap = coverIds.Length == 0
                ? new Dictionary<long, string>()
                : await _db.Images.AsNoTracking()
                    .Where(m => coverIds.Contains(m.Id))
                    .Select(m => new { m.Id, m.Url })
                    .ToDictionaryAsync(x => x.Id, x => x.Url);

            var ids = pageItems.Select(x => x.Id).ToArray();
            
            // Lấy tất cả images cho từng restaurant
            var allImages = await _db.ImageLinks.AsNoTracking()
                .Include(l => l.Image)
                .Where(l => l.TargetType == ImageOwner.Restaurant && ids.Contains(l.TargetId))
                .OrderBy(l => l.TargetId).ThenByDescending(l => l.IsCover).ThenBy(l => l.Position).ThenBy(l => l.Id)
                .Select(l => new { 
                    l.TargetId, 
                    LinkId = l.Id,
                    MediaId = l.ImageId,
                    l.IsCover,
                    l.Position,
                    l.Image.Url,
                    l.Image.AltText,
                    l.Image.Caption
                })
                .ToListAsync();

            // Group images by restaurant
            var imagesByRestaurant = allImages.GroupBy(img => img.TargetId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var firstLinkUrlByRestaurant = new Dictionary<long, string>();
            foreach (var link in allImages)
                if (!firstLinkUrlByRestaurant.ContainsKey(link.TargetId))
                    firstLinkUrlByRestaurant[link.TargetId] = link.Url;

            // Lấy Category objects
            var categoryIds = pageItems.Where(x => x.CategoryId.HasValue).Select(x => x.CategoryId!.Value).Distinct().ToArray();
            var categories = categoryIds.Length == 0
                ? new Dictionary<long, object>()
                : await _db.Categories.AsNoTracking()
                    .Where(c => categoryIds.Contains(c.Id))
                    .Select(c => new { c.Id, c.Name, c.Slug })
                    .ToDictionaryAsync(x => x.Id, x => (object)x);

            // Lấy CoverImage objects
            var coverImageIds = pageItems.Where(x => x.CoverImageId.HasValue).Select(x => x.CoverImageId!.Value).Distinct().ToArray();
            var coverImages = coverImageIds.Length == 0
                ? new Dictionary<long, object>()
                : await _db.Images.AsNoTracking()
                    .Where(img => coverImageIds.Contains(img.Id))
                    .Select(img => new { img.Id, img.Url, img.AltText, img.Caption })
                    .ToDictionaryAsync(x => x.Id, x => (object)x);

            var items = pageItems.Select(r =>
            {
                var category = r.CategoryId.HasValue && categories.TryGetValue(r.CategoryId.Value, out var cat) ? cat : null;
                var coverImage = r.CoverImageId.HasValue && coverImages.TryGetValue(r.CoverImageId.Value, out var cov) ? cov : null;

                // Lấy images cho restaurant này
                var restaurantImages = imagesByRestaurant.TryGetValue(r.Id, out var imgs) ? imgs.Cast<object>().ToList() : new List<object>();

                return new {
                    r.Id, r.Name, r.Slug, r.Summary, r.Content,
                    r.Address, r.Phone, r.Website, r.PriceRangeText,
                    Category = category,
                    CoverImage = coverImage,
                    r.IsPublished, r.CreatedAt, r.UpdatedAt,
                    Images = restaurantImages
                };
            });

            return Ok(new PagedResponse<object>(200, "Success", total, page, pageSize, items));
        }

        // ==== GET BY ID: trả gallery đầy đủ ====
        [HttpGet("restaurants/get/{id:long}"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<object>> Get(long id)
        {
            var r = await _db.Restaurants.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (r is null)
                return NotFound(new ApiResponse<object>(404, $"Restaurant with id={id} not found.", null));

            var gallery = await _db.ImageLinks.AsNoTracking()
                .Include(l => l.Image)
                .Where(l => l.TargetType == ImageOwner.Restaurant && l.TargetId == id)
                .OrderBy(l => l.Position)
                .Select(l => new {
                    LinkId = l.Id, MediaId = l.ImageId, l.IsCover, l.Position,
                    l.Image.Url, l.Image.AltText, l.Image.Caption
                })
                .ToListAsync();

            // Lấy Category object
            var category = r.CategoryId.HasValue 
                ? await _db.Categories.AsNoTracking()
                    .Where(c => c.Id == r.CategoryId.Value)
                    .Select(c => new { c.Id, c.Name, c.Slug })
                    .FirstOrDefaultAsync()
                : null;

            // Lấy CoverImage object
            var coverImage = r.CoverImageId.HasValue
                ? await _db.Images.AsNoTracking()
                    .Where(img => img.Id == r.CoverImageId.Value)
                    .Select(img => new { img.Id, img.Url, img.AltText, img.Caption })
                    .FirstOrDefaultAsync()
                : null;

            var data = new {
                r.Id, r.Name, r.Slug, r.Summary, r.Content,
                r.Address, r.Phone, r.Website, r.PriceRangeText,
                r.IsPublished, r.CreatedAt, r.UpdatedAt,
                Category = category,
                CoverImage = coverImage,
                Images = gallery
            };

            return Ok(new ApiResponse<object>(200, "Success", data));
        }

        // ==== CREATE (one-step images) ====
        [HttpPost("restaurants/create"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<object>> Create([FromBody] CreateRestaurantWithImagesDto dto)
        {
            using var tx = await _db.Database.BeginTransactionAsync();

            try
            {
                var e = new Restaurant {
                    Name = dto.Name, Slug = dto.Slug, Summary = dto.Summary, Content = dto.Content,
                    Address = dto.Address, Phone = dto.Phone, Website = dto.Website, PriceRangeText = dto.PriceRangeText,
                    CategoryId = dto.CategoryId, IsPublished = dto.IsPublished,
                    CreatedAt = DateTime.UtcNow
                };
                _db.Restaurants.Add(e);
                await _db.SaveChangesAsync();

                if (dto.Images is { Length: > 0 })
                {
                    var medias = new List<Image>();
                    foreach (var img in dto.Images)
                    {
                        var m = new Image { Url = img.Url, AltText = img.AltText, Caption = img.Caption, CreatedAt = DateTime.UtcNow, CreatedBy = User.UserId() };
                        _db.Images.Add(m);
                        medias.Add(m);
                    }
                    await _db.SaveChangesAsync();

                    foreach (var (img, idx) in dto.Images.Select((v, i) => (v, i)))
                    {
                        var mediaId = medias[idx].Id;
                        _db.ImageLinks.Add(new ImageLink {
                            ImageId = mediaId, TargetType = ImageOwner.Restaurant, TargetId = e.Id,
                            Position = img.Position, IsCover = img.IsCover, CreatedAt = DateTime.UtcNow
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
                    new ApiResponse<object>(201, "Restaurant created successfully.", new { id = e.Id }));
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return StatusCode(500, new ApiResponse<object>(500, $"Failed to create restaurant: {ex.Message}", null));
            }
        }

        // ==== UPDATE (one-step images) ====
        [HttpPut("restaurants/update/{id:long}"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateRestaurantWithImagesDto dto)
        {
            var e = await _db.Restaurants.FindAsync(id);
            if (e is null)
                return NotFound(new ApiResponse<object>(404, $"Restaurant with id={id} not found.", null));

            using var tx = await _db.Database.BeginTransactionAsync();

            try
            {
                e.Name = dto.Name; e.Slug = dto.Slug; e.Summary = dto.Summary; e.Content = dto.Content;
                e.Address = dto.Address; e.Phone = dto.Phone; e.Website = dto.Website; e.PriceRangeText = dto.PriceRangeText;
                e.CategoryId = dto.CategoryId; e.IsPublished = dto.IsPublished; e.CreatedAt = dto.CreatedAt; e.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();

                // Add new images
                if (dto.AddImages is { Length: > 0 })
                {
                    var created = new List<(NewImageItem item, long mediaId)>();
                    foreach (var img in dto.AddImages)
                    {
                        var m = new Image { Url = img.Url, AltText = img.AltText, Caption = img.Caption, CreatedAt = DateTime.UtcNow, CreatedBy = User.UserId() };
                        _db.Images.Add(m); await _db.SaveChangesAsync();
                        _db.ImageLinks.Add(new ImageLink {
                            ImageId = m.Id, TargetType = ImageOwner.Restaurant, TargetId = e.Id,
                            Position = img.Position, IsCover = img.IsCover, CreatedAt = DateTime.UtcNow
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

                // Attach existing media
                if (dto.AttachMediaIds is { Length: > 0 })
                {
                    foreach (var mid in dto.AttachMediaIds.Distinct())
                    {
                        var exists = await _db.ImageLinks.AnyAsync(l => l.TargetType == ImageOwner.Restaurant && l.TargetId == e.Id && l.ImageId == mid);
                        if (exists) continue;

                        _db.ImageLinks.Add(new ImageLink {
                            ImageId = mid, TargetType = ImageOwner.Restaurant, TargetId = e.Id,
                            Position = 0, IsCover = false, CreatedAt = DateTime.UtcNow
                        });
                    }
                    await _db.SaveChangesAsync();
                }

                // Remove links
                if (dto.RemoveLinkIds is { Length: > 0 })
                {
                    var links = await _db.ImageLinks
                        .Where(l => dto.RemoveLinkIds.Contains(l.Id) && l.TargetType == ImageOwner.Restaurant && l.TargetId == e.Id)
                        .ToListAsync();
                    _db.ImageLinks.RemoveRange(links);
                    await _db.SaveChangesAsync();

                    if (e.CoverImageId.HasValue)
                    {
                        var still = await _db.ImageLinks.AnyAsync(l => l.TargetType == ImageOwner.Restaurant && l.TargetId == e.Id && l.ImageId == e.CoverImageId.Value);
                        if (!still) { e.CoverImageId = null; await _db.SaveChangesAsync(); }
                    }
                }

                // Reorder
                if (dto.Reorders is { Length: > 0 })
                {
                    var ids = dto.Reorders.Select(r => r.ImageLinkId).ToArray();
                    var links = await _db.ImageLinks.Where(l => l.TargetType == ImageOwner.Restaurant && l.TargetId == e.Id && ids.Contains(l.Id)).ToListAsync();
                    foreach (var l in links)
                        l.Position = dto.Reorders.First(r => r.ImageLinkId == l.Id).Position;
                    await _db.SaveChangesAsync();
                }

                // Set Cover
                if (dto.CoverImageId.HasValue)
                {
                    var linked = await _db.ImageLinks.AnyAsync(l => l.TargetType == ImageOwner.Restaurant && l.TargetId == e.Id && l.ImageId == dto.CoverImageId.Value);
                    e.CoverImageId = linked ? dto.CoverImageId : null;
                    await _db.SaveChangesAsync();

                    var links = await _db.ImageLinks.Where(l => l.TargetType == ImageOwner.Restaurant && l.TargetId == e.Id).ToListAsync();
                    foreach (var l in links) l.IsCover = (l.ImageId == e.CoverImageId);
                    await _db.SaveChangesAsync();
                }

                await tx.CommitAsync();
                return Ok(new ApiResponse<object>(200, "Restaurant updated successfully.", null));
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return StatusCode(500, new ApiResponse<object>(500, $"Failed to update restaurant: {ex.Message}", null));
            }
        }

        // ==== DELETE ====
        [HttpDelete("restaurants/delete/{id:long}"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(long id)
        {
            var e = await _db.Restaurants.FindAsync(id);
            if (e is null)
                return NotFound(new ApiResponse<object>(404, $"Restaurant with id={id} not found.", null));

            var links = await _db.ImageLinks.Where(l => l.TargetType == ImageOwner.Restaurant && l.TargetId == id).ToListAsync();
            _db.ImageLinks.RemoveRange(links);
            _db.Remove(e);
            await _db.SaveChangesAsync();

            return Ok(new ApiResponse<object>(200, "Restaurant deleted successfully.", null));
        }
    }
}
