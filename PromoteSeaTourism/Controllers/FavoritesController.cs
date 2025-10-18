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

            var items = await _db.Favorites
                .AsNoTracking()
                .Where(x => x.UserId == uid)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(new ApiResponse<IEnumerable<Favorite>>(
                200,
                items.Count == 0 ? "No favorites found." : "Success",
                items
            ));
        }

        // ===== UPSERT (ADD IF NOT EXISTS) =====
        [HttpPost("favorites/create"), Authorize]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> Upsert([FromBody] UpsertFavoriteDto dto)
        {
            var uid = User.UserId()!.Value;

            var exists = await _db.Favorites.FindAsync(uid, dto.TargetType, dto.TargetId);
            if (exists is null)
            {
                var entity = new Favorite
                {
                    UserId = uid,
                    TargetType = dto.TargetType,
                    TargetId = dto.TargetId,
                    CreatedAt = DateTime.UtcNow
                };

                _db.Favorites.Add(entity);
                await _db.SaveChangesAsync();

                // 201 Created với payload chuẩn
                return CreatedAtAction(nameof(ListMine), null,
                    new ApiResponse<object>(201, "Favorite added.", new
                    {
                        targetType = dto.TargetType,
                        targetId = dto.TargetId
                    }));
            }

            // Đã tồn tại: trả 200 với message (thay cho 204 NoContent để có body)
            return Ok(new ApiResponse<object>(200, "Favorite already exists. No changes made.", null));
        }

        // ===== REMOVE =====
        [HttpDelete("favorites/delete"), Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Remove([FromQuery] ContentTarget targetType, [FromQuery] long targetId)
        {
            var uid = User.UserId()!.Value;

            var f = await _db.Favorites.FindAsync(uid, targetType, targetId);
            if (f is null)
                return NotFound(new ApiResponse<object>(404, "Favorite not found.", null));

            _db.Remove(f);
            await _db.SaveChangesAsync();

            return Ok(new ApiResponse<object>(200, "Favorite removed successfully.", null));
        }
    }
}
