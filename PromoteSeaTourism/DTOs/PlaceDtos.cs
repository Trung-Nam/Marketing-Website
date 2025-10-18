using System.ComponentModel.DataAnnotations;

namespace PromoteSeaTourism.DTOs
{
    public record CreatePlaceDto(
        [Required] string Name,
        [Required] string Slug,
        string? Summary,
        string? Content,
        string? Address,
        string? Province,
        string? District,
        string? Ward,
        decimal? GeoLat,
        decimal? GeoLng,
        string? BestSeason,
        string? TicketInfo,
        string? OpeningHours,
        long? CategoryId,
        long? CoverImageId,
        bool IsPublished
    );

    public record UpdatePlaceDto(
        [Required] string Name,
        [Required] string Slug,
        string? Summary,
        string? Content,
        string? Address,
        string? Province,
        string? District,
        string? Ward,
        decimal? GeoLat,
        decimal? GeoLng,
        string? BestSeason,
        string? TicketInfo,
        string? OpeningHours,
        long? CategoryId,
        long? CoverImageId,
        bool IsPublished
    );
}
