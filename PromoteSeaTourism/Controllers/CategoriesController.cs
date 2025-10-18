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
    public class CategoriesController : AppControllerBase
    {
        public CategoriesController(AppDbContext db) : base(db) { }

        // ===== LIST =====
        [HttpGet("categories/list"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> List(int page = 1, int pageSize = 20)
        {
            var q = _db.Categories.AsNoTracking().OrderBy(c => c.Name);
            var total = await q.CountAsync();
            var items = await Page(q, page, pageSize).ToListAsync();

            return Ok(new PagedResponse<Category>(
                200,
                items.Count == 0 ? "No categories found." : "Success",
                total,
                page,
                pageSize,
                items
            ));
        }

        // ===== GET BY ID =====
        [HttpGet("categories/get/{id:long}"), AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<object>> Get(long id)
        {
            var e = await _db.Categories.FindAsync(id);
            if (e is null)
                return NotFound(new ApiResponse<object>(404, $"Category with id={id} not found.", null));

            return Ok(new ApiResponse<Category>(200, "Success", e));
        }

        // ===== CREATE =====
        [HttpPost("categories/create"), Authorize(Roles = nameof(UserRole.Admin))]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<ActionResult<object>> Create([FromBody] CreateCategoryDto dto)
        {
            var e = new Category
            {
                Name = dto.Name,
                Slug = dto.Slug,
                Type = dto.Type,
                IsActive = true
            };
            _db.Categories.Add(e);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = e.Id },
                new ApiResponse<Category>(201, "Category created successfully.", e));
        }

        // ===== UPDATE =====
        [HttpPut("categories/update/{id:long}"), Authorize(Roles = nameof(UserRole.Admin))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateCategoryDto dto)
        {
            var e = await _db.Categories.FindAsync(id);
            if (e is null)
                return NotFound(new ApiResponse<object>(404, $"Category with id={id} not found.", null));

            e.Name = dto.Name;
            e.Slug = dto.Slug;
            e.Type = dto.Type;
            e.IsActive = dto.IsActive;

            await _db.SaveChangesAsync();

            return Ok(new ApiResponse<object>(200, "Category updated successfully.", null));
        }

        // ===== DELETE =====
        [HttpDelete("categories/delete/{id:long}"), Authorize(Roles = nameof(UserRole.Admin))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(long id)
        {
            var e = await _db.Categories.FindAsync(id);
            if (e is null)
                return NotFound(new ApiResponse<object>(404, $"Category with id={id} not found.", null));

            _db.Remove(e);
            await _db.SaveChangesAsync();

            return Ok(new ApiResponse<object>(200, "Category deleted successfully.", null));
        }
    }
}
