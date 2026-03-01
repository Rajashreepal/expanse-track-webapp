namespace Backend.Models;

public class User
{
    public string Id { get; set; } = string.Empty;
    public string Fname { get; set; } = string.Empty;
    public string Lname { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string Department { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum UserRole
{
    Employee,
    Manager
}
