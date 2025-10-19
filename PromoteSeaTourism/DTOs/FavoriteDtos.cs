using PromoteSeaTourism.Models;

namespace PromoteSeaTourism.DTOs
{
    public record UpsertFavoriteDto(
        string TargetType,
        long TargetId
    );
}
