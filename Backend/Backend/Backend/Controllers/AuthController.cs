using Backend.Models.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// User login - Returns JWT token
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public ActionResult<object> Login([FromBody] LoginRequest request)
    {
        var result = _authService.Login(request);
        
        if (!result.Success)
            return Unauthorized(result);

        return Ok(new
        {
            success = true,
            data = new
            {
                token = result.Token,
                user = result.User
            }
        });
    }

    /// <summary>
    /// User registration - Returns JWT token
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public ActionResult<object> Register([FromBody] RegisterRequest request)
    {
        var result = _authService.Register(request);
        
        if (!result.Success)
            return BadRequest(result);

        return Ok(new
        {
            success = true,
            data = new
            {
                token = result.Token,
                user = result.User
            }
        });
    }

    /// <summary>
    /// Get current user details from JWT token
    /// </summary>
    [HttpGet("me")]
    [Backend.Attributes.Authorize]
    public ActionResult<object> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, error = "Invalid token" });

        var user = _authService.GetCurrentUser(userId);
        
        if (user == null)
            return NotFound(new { success = false, error = "User not found" });

        return Ok(new
        {
            success = true,
            data = new UserDto
            {
                Id = user.Id,
                Fname = user.Fname,
                Lname = user.Lname,
                Email = user.Email,
                Role = user.Role.ToString().ToLower(),
                Department = user.Department,
                CreatedAt = user.CreatedAt.ToString("o")
            }
        });
    }
}
