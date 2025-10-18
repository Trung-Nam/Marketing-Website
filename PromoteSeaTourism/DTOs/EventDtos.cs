namespace PromoteSeaTourism.DTOs
{
    public record CreateEventWithImagesDto(
        string Title,
        string Slug,
        string? Summary,
        string? Content,
        DateTime StartTime,
        DateTime? EndTime,
        string? Address,
        string? PriceInfo,
        long CategoryId,
        long? PlaceId,
        bool IsPublished,
        NewImageItem[]? Images
    );

    public record UpdateEventWithImagesDto(
        string Title,
        string Slug,
        string? Summary,
        string? Content,
        DateTime StartTime,
        DateTime? EndTime,
        string? Address,
        string? PriceInfo,
        long CategoryId,
        long? PlaceId,
        bool IsPublished,
        NewImageItem[]? AddImages,
        long[]? RemoveLinkIds
    );
}
