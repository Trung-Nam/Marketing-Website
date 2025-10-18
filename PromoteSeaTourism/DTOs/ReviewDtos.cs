using System.ComponentModel.DataAnnotations;
using PromoteSeaTourism.Models;

namespace PromoteSeaTourism.DTOs
{
    public record CreateReviewWithImagesDto(
        ContentTarget TargetType,
        long TargetId,
        sbyte Rating,
        string? Title,
        string? Content,
        NewImageItem[]? Images  
            );

    public record UpdateReviewDto(
        [Range(1, 5)] sbyte Rating,
        string? Title,
        string? Content
    );
}
