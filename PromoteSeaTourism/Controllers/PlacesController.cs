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
    public class PlacesController : AppControllerBase
    {
        public PlacesController(AppDbContext db) : base(db) { }

        // ===== LIST (public) =====
        [HttpGet("places/list"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> List(
            int page = 1, 
            int pageSize = 20, 
            bool? published = null,
            long? categoryId = null)
        {
            var q = _db.Places.AsNoTracking();
            
            if (published.HasValue) 
                q = q.Where(x => x.IsPublished == published.Value);
            
            if (categoryId.HasValue) 
                q = q.Where(x => x.CategoryId == categoryId.Value);
            
            q = q.OrderByDescending(x => x.CreatedAt);

            var total = await q.CountAsync();
            var pageItems = await Page(q, page, pageSize)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Slug,
                    p.Summary,
                    p.Address,
                    p.Province,
                    p.District,
                    p.Ward,
                    p.GeoLat,
                    p.GeoLng,
                    p.BestSeason,
                    p.TicketInfo,
                    p.OpeningHours,
                    p.CoverImageId,
                    p.CategoryId,
                    p.IsPublished,
                    p.CreatedAt,
                    p.UpdatedAt
                })
                .ToListAsync();

            if (!pageItems.Any())
                return Ok(new PagedResponse<object>(200, "No places found.", total, page, pageSize, Array.Empty<object>()));

            // Get cover image URLs
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

            // Build result with thumbnail URLs
            var items = pageItems.Select(p => new
            {
                p.Id,
                p.Name,
                p.Slug,
                p.Summary,
                p.Address,
                p.Province,
                p.District,
                p.Ward,
                p.GeoLat,
                p.GeoLng,
                p.BestSeason,
                p.TicketInfo,
                p.OpeningHours,
                p.CoverImageId,
                ThumbnailUrl = p.CoverImageId.HasValue && coverUrlMap.TryGetValue(p.CoverImageId.Value, out var url) ? url : null,
                p.CategoryId,
                p.IsPublished,
                p.CreatedAt,
                p.UpdatedAt
            });

            return Ok(new PagedResponse<object>(200, "Success", total, page, pageSize, items));
        }

        // ===== GET BY ID (public) =====
        [HttpGet("places/get/{id:long}"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<object>> Get(long id)
        {
            var p = await _db.Places
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (p is null)
                return NotFound(new ApiResponse<object>(404, $"Place with id={id} not found.", null));

            // Get cover image URL if exists
            string? thumbnailUrl = null;
            if (p.CoverImageId.HasValue)
            {
                var cover = await _db.Images.AsNoTracking()
                    .FirstOrDefaultAsync(i => i.Id == p.CoverImageId.Value);
                thumbnailUrl = cover?.Url;
            }

            var data = new
            {
                p.Id,
                p.Name,
                p.Slug,
                p.Summary,
                p.Content,
                p.Address,
                p.Province,
                p.District,
                p.Ward,
                p.GeoLat,
                p.GeoLng,
                p.BestSeason,
                p.TicketInfo,
                p.OpeningHours,
                p.CoverImageId,
                ThumbnailUrl = thumbnailUrl,
                p.CategoryId,
                p.IsPublished,
                p.CreatedAt,
                p.UpdatedAt
            };

            return Ok(new ApiResponse<object>(200, "Success", data));
        }

        // ===== CREATE =====
        [HttpPost("places/create"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<ActionResult<object>> Create([FromBody] CreatePlaceDto dto)
        {
            var e = new Place
            {
                Name = dto.Name,
                Slug = dto.Slug,
                Summary = dto.Summary,
                Content = dto.Content,
                Address = dto.Address,
                Province = dto.Province,
                District = dto.District,
                Ward = dto.Ward,
                GeoLat = dto.GeoLat,
                GeoLng = dto.GeoLng,
                BestSeason = dto.BestSeason,
                TicketInfo = dto.TicketInfo,
                OpeningHours = dto.OpeningHours,
                CoverImageId = dto.CoverImageId,
                CategoryId = dto.CategoryId,
                IsPublished = dto.IsPublished,
                CreatedAt = DateTime.UtcNow
            };
            
            _db.Places.Add(e);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = e.Id },
                new ApiResponse<object>(201, "Place created successfully.", new { id = e.Id }));
        }

        // ===== UPDATE =====
        [HttpPut("places/update/{id:long}"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(long id, [FromBody] UpdatePlaceDto dto)
        {
            var e = await _db.Places.FindAsync(id);
            if (e is null)
                return NotFound(new ApiResponse<object>(404, $"Place with id={id} not found.", null));

            e.Name = dto.Name;
            e.Slug = dto.Slug;
            e.Summary = dto.Summary;
            e.Content = dto.Content;
            e.Address = dto.Address;
            e.Province = dto.Province;
            e.District = dto.District;
            e.Ward = dto.Ward;
            e.GeoLat = dto.GeoLat;
            e.GeoLng = dto.GeoLng;
            e.BestSeason = dto.BestSeason;
            e.TicketInfo = dto.TicketInfo;
            e.OpeningHours = dto.OpeningHours;
            e.CoverImageId = dto.CoverImageId;
            e.CategoryId = dto.CategoryId;
            e.IsPublished = dto.IsPublished;
            e.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(new ApiResponse<object>(200, "Place updated successfully.", null));
        }

        // ===== DELETE =====
        [HttpDelete("places/delete/{id:long}"), Authorize(Roles = nameof(UserRole.Admin))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(long id)
        {
            var e = await _db.Places.FindAsync(id);
            if (e is null)
                return NotFound(new ApiResponse<object>(404, $"Place with id={id} not found.", null));

            _db.Remove(e);
            await _db.SaveChangesAsync();

            return Ok(new ApiResponse<object>(200, "Place deleted successfully.", null));
        }
    }
}
