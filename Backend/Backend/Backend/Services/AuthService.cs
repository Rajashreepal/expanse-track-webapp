using Backend.Models;
using Backend.Models.DTOs;
using Backend.Helpers;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly JwtHelper _jwtHelper;

    public AuthService(ApplicationDbContext context, JwtHelper jwtHelper)
    {
        _context = context;
        _jwtHelper = jwtHelper;
    }

    public AuthResponse Login(LoginRequest request)
    {
        var role = request.Role.ToLower() == "employee" ? UserRole.Employee : UserRole.Manager;
        var user = _context.Users.FirstOrDefault(u => 
            u.Email == request.Email && 
            u.Role == role);

        if (user == null || !PasswordHelper.VerifyPassword(request.Password, user.Password))
        {
            return new AuthResponse
            {
                Success = false,
                Error = "Invalid credentials or wrong role selected."
            };
        }

        var token = _jwtHelper.GenerateToken(user);

        return new AuthResponse
        {
            Success = true,
            User = MapToDto(user),
            Token = token
        };
    }

    public AuthResponse Register(RegisterRequest request)
    {
        if (_context.Users.Any(u => u.Email == request.Email))
        {
            return new AuthResponse
            {
                Success = false,
                Error = "Email is already registered."
            };
        }

        var user = new User
        {
            Id = "u_" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            Fname = request.Fname,
            Lname = request.Lname,
            Email = request.Email,
            Password = PasswordHelper.HashPassword(request.Password),
            Role = request.Role.ToLower() == "employee" ? UserRole.Employee : UserRole.Manager,
            Department = request.Department,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        _context.SaveChanges();

        var token = _jwtHelper.GenerateToken(user);

        return new AuthResponse
        {
            Success = true,
            User = MapToDto(user),
            Token = token
        };
    }

    public User? GetCurrentUser(string userId)
    {
        return _context.Users.FirstOrDefault(u => u.Id == userId);
    }

    public List<User> GetAllUsers()
    {
        return _context.Users.ToList();
    }

    private UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Fname = user.Fname,
            Lname = user.Lname,
            Email = user.Email,
            Role = user.Role.ToString().ToLower(),
            Department = user.Department,
            CreatedAt = user.CreatedAt.ToString("o")
        };
    }
}
