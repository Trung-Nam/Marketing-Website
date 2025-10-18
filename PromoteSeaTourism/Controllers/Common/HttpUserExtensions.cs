using System.Security.Claims;
using PromoteSeaTourism.Models;

namespace PromoteSeaTourism.Controllers.Common
{
    public static class HttpUserExtensions
    {
        public static long? UserId(this ClaimsPrincipal user)
        {
            var sub = user.FindFirstValue("sub") ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(sub, out var id) ? id : null;
        }

        public static bool IsInRole(this ClaimsPrincipal user, UserRole role)
            => user.IsInRole(role.ToString());
    }
}
