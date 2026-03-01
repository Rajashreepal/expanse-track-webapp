using Backend.Models;
using Backend.Models.DTOs;

namespace Backend.Services;

public interface IAuthService
{
    AuthResponse Login(LoginRequest request);
    AuthResponse Register(RegisterRequest request);
    User? GetCurrentUser(string userId);
    List<User> GetAllUsers();
}
