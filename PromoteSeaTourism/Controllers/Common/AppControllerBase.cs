using Microsoft.AspNetCore.Mvc;
using PromoteSeaTourism.Data;

namespace PromoteSeaTourism.Controllers.Common
{
    [ApiController]
    public abstract class AppControllerBase : ControllerBase
    {
        protected readonly AppDbContext _db;
        protected AppControllerBase(AppDbContext db) => _db = db;

        protected static IQueryable<T> Page<T>(IQueryable<T> q, int page, int pageSize)
            => q.Skip(Math.Max(0, (page - 1)) * Math.Clamp(pageSize, 1, 200))
                .Take(Math.Clamp(pageSize, 1, 200));
    }

    public record PagedResult<T>(IEnumerable<T> Items, int Total, int Page, int PageSize);
}
