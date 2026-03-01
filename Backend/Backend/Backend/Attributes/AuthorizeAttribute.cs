using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace Backend.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AuthorizeAttribute : Attribute, IAuthorizationFilter
{
    private readonly string[]? _roles;

    public AuthorizeAttribute(params string[] roles)
    {
        _roles = roles.Length > 0 ? roles : null;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;

        if (!user.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new JsonResult(new { success = false, error = "Unauthorized" })
            {
                StatusCode = StatusCodes.Status401Unauthorized
            };
            return;
        }

        if (_roles != null && _roles.Length > 0)
        {
            var userRole = user.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole == null || !_roles.Contains(userRole, StringComparer.OrdinalIgnoreCase))
            {
                context.Result = new JsonResult(new { success = false, error = "Forbidden - Insufficient permissions" })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
            }
        }
    }
}
