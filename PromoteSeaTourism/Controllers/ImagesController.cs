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
    public class ImagesController : AppControllerBase
    {
        public ImagesController(AppDbContext db) : base(db) { }

        // ===== LIST (public) =====
        [HttpGet("images/list"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> List(
            int page = 1, 
            int pageSize = 20,
            long? createdBy = null)
        {
            var q = _db.Images.AsNoTracking();
            
            if (createdBy.HasValue) 
                q = q.Where(x => x.CreatedBy == createdBy.Value);
            
            q = q.OrderByDescending(x => x.CreatedAt);

            var total = await q.CountAsync();
            var pageItems = await Page(q, page, pageSize)
                .Select(i => new
                {
                    i.Id,
                    i.Url,
                    i.AltText,
                    i.Caption,
                    i.CreatedBy,
                    i.CreatedAt
                })
                .ToListAsync();

            if (!pageItems.Any())
                return Ok(new PagedResponse<object>(200, "No images found.", total, page, pageSize, Array.Empty<object>()));

            return Ok(new PagedResponse<object>(200, "Success", total, page, pageSize, pageItems));
        }

        // ===== GET BY ID (public) =====
        [HttpGet("images/get/{id:long}"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<object>> Get(long id)
        {
            var i = await _db.Images
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (i is null)
                return NotFound(new ApiResponse<object>(404, $"Image with id={id} not found.", null));

            var data = new
            {
                i.Id,
                i.Url,
                i.AltText,
                i.Caption,
                i.CreatedBy,
                i.CreatedAt
            };

            return Ok(new ApiResponse<object>(200, "Success", data));
        }

        // ===== CREATE =====
        [HttpPost("images/create"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<ActionResult<object>> Create([FromBody] CreateImageDto dto)
        {
            var e = new Image
            {
                Url = dto.Url,
                AltText = dto.AltText,
                Caption = dto.Caption,
                CreatedBy = User.UserId(),
                CreatedAt = DateTime.UtcNow
            };
            
            _db.Images.Add(e);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = e.Id },
                new ApiResponse<object>(201, "Image created successfully.", new { id = e.Id }));
        }

        // ===== UPDATE =====
        [HttpPut("images/update/{id:long}"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(long id, [FromBody] CreateImageDto dto)
        {
            var e = await _db.Images.FindAsync(id);
            if (e is null)
                return NotFound(new ApiResponse<object>(404, $"Image with id={id} not found.", null));

            e.Url = dto.Url;
            e.AltText = dto.AltText;
            e.Caption = dto.Caption;

            await _db.SaveChangesAsync();

            return Ok(new ApiResponse<object>(200, "Image updated successfully.", null));
        }

        // ===== DELETE =====
        [HttpDelete("images/delete/{id:long}"), Authorize(Roles = nameof(UserRole.Admin))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(long id)
        {
            var e = await _db.Images.FindAsync(id);
            if (e is null)
                return NotFound(new ApiResponse<object>(404, $"Image with id={id} not found.", null));

            // Check if image is linked to any entities
            var hasLinks = await _db.ImageLinks.AnyAsync(l => l.ImageId == id);
            if (hasLinks)
                return BadRequest(new ApiResponse<object>(400, "Cannot delete image that is linked to entities. Remove links first.", null));

            _db.Remove(e);
            await _db.SaveChangesAsync();

            return Ok(new ApiResponse<object>(200, "Image deleted successfully.", null));
        }

        // ===== LINK IMAGE TO ENTITY =====
        [HttpPost("images/link"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<object>> LinkImage([FromBody] LinkImageDto dto)
        {
            // Check if image exists
            var image = await _db.Images.FindAsync(dto.TargetId);
            if (image is null)
                return BadRequest(new ApiResponse<object>(400, "Image not found.", null));

            // Check if target entity exists (basic validation)
            bool targetExists = dto.TargetType switch
            {
                ImageOwner.Article => await _db.Articles.AnyAsync(a => a.Id == dto.TargetId),
                ImageOwner.Restaurant => await _db.Restaurants.AnyAsync(r => r.Id == dto.TargetId),
                ImageOwner.Accommodation => await _db.Accommodations.AnyAsync(a => a.Id == dto.TargetId),
                ImageOwner.Tour => await _db.Tours.AnyAsync(t => t.Id == dto.TargetId),
                ImageOwner.Event => await _db.Events.AnyAsync(e => e.Id == dto.TargetId),
                ImageOwner.Review => await _db.Reviews.AnyAsync(r => r.Id == dto.TargetId),
                _ => false
            };

            if (!targetExists)
                return BadRequest(new ApiResponse<object>(400, "Target entity not found.", null));

            // Check if link already exists
            var existingLink = await _db.ImageLinks
                .FirstOrDefaultAsync(l => l.ImageId == dto.TargetId && l.TargetType == dto.TargetType && l.TargetId == dto.TargetId);
            
            if (existingLink is not null)
                return BadRequest(new ApiResponse<object>(400, "Image is already linked to this entity.", null));

            var link = new ImageLink
            {
                ImageId = dto.TargetId,
                TargetType = dto.TargetType,
                TargetId = dto.TargetId,
                Position = dto.Position,
                IsCover = dto.IsCover,
                CreatedAt = DateTime.UtcNow
            };

            _db.ImageLinks.Add(link);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = link.Id },
                new ApiResponse<object>(201, "Image linked successfully.", new { linkId = link.Id }));
        }

        // ===== UNLINK IMAGE FROM ENTITY =====
        [HttpDelete("images/unlink/{linkId:long}"), Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Editor)}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UnlinkImage(long linkId)
        {
            var link = await _db.ImageLinks.FindAsync(linkId);
            if (link is null)
                return NotFound(new ApiResponse<object>(404, $"Image link with id={linkId} not found.", null));

            _db.ImageLinks.Remove(link);
            await _db.SaveChangesAsync();

            return Ok(new ApiResponse<object>(200, "Image unlinked successfully.", null));
        }

        // ===== GET IMAGE LINKS =====
        [HttpGet("images/links/{imageId:long}"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> GetImageLinks(long imageId)
        {
            var links = await _db.ImageLinks
                .AsNoTracking()
                .Where(l => l.ImageId == imageId)
                .Select(l => new
                {
                    l.Id,
                    l.TargetType,
                    l.TargetId,
                    l.Position,
                    l.IsCover,
                    l.CreatedAt
                })
                .ToListAsync();

            return Ok(new ApiResponse<object>(200, "Success", links));
        }
    }
}



