using System.ComponentModel.DataAnnotations;
using PromoteSeaTourism.Models;

namespace PromoteSeaTourism.DTOs
{
    public record CreateImageDto(
        [Required, Url] string Url,
        string? AltText,
        string? Caption
    );

    public record LinkImageDto(
        ImageOwner TargetType,
        long TargetId,
        int Position = 0,
        bool IsCover = false
    );
}
