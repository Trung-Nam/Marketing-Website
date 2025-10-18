using System.ComponentModel.DataAnnotations;

namespace PromoteSeaTourism.DTOs
{
    public record CreateRestaurantDto(
        [Required] string Name,
        [Required] string Slug,
        string? Summary,
        string? Content,
        string? Address,
        string? Phone,
        string? Website,
        string? PriceRangeText,
        long? CategoryId,
        long? CoverImageId,
        bool IsPublished
    );

    public record UpdateRestaurantDto(
        [Required] string Name,
        [Required] string Slug,
        string? Summary,
        string? Content,
        string? Address,
        string? Phone,
        string? Website,
        string? PriceRangeText,
        long? CategoryId,
        long? CoverImageId,
        bool IsPublished
    );
}
