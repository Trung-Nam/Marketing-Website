using System.ComponentModel.DataAnnotations;
using PromoteSeaTourism.Models;

namespace PromoteSeaTourism.DTOs
{
    public record CreateCategoryDto([Required] string Name, [Required] string Slug, string Type);
    public record UpdateCategoryDto([Required] string Name, [Required] string Slug, string Type, bool IsActive);
}
