using Microsoft.EntityFrameworkCore;

namespace PromoteSeaTourism.Infrastructure
{
    public static class QueryableExtensions
    {
        public static async Task<(long total, List<T> items)> ToPagedAsync<T>(
            this IQueryable<T> query, int page, int pageSize, CancellationToken ct = default)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;

            var total = await query.LongCountAsync(ct);
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (total, items);
        }
    }
}
