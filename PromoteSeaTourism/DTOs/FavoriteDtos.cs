using PromoteSeaTourism.Models;

namespace PromoteSeaTourism.DTOs
{
    public record UpsertFavoriteDto(
        ContentTarget TargetType,
        long TargetId
    );
}
