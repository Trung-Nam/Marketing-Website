using System.ComponentModel.DataAnnotations;

namespace PromoteSeaTourism.DTOs
{
    public record CreateAccommodationDto(
        [Required] string Name,
        [Required] string Slug,
        string? Summary,
        string? Content,
        string? Address,
        string? Phone,
        string? Website,
        sbyte? Star,
        decimal? MinPrice,
        decimal? MaxPrice,
        long? CategoryId,
        long? CoverImageId,
        bool IsPublished
    );

    public record UpdateAccommodationDto(
        [Required] string Name,
        [Required] string Slug,
        string? Summary,
        string? Content,
        string? Address,
        string? Phone,
        string? Website,
        sbyte? Star,
        decimal? MinPrice,
        decimal? MaxPrice,
        long? CategoryId,
        long? CoverImageId,
        bool IsPublished
    );
}
