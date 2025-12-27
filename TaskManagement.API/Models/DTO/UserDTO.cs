namespace TaskManagement.API.Models.DTOs;

public class UserDTO
{
    public Guid Id { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public required string Role { get; set; }
}

public class RegisterUserRequestDTO
{
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
}

public class UpdateUserRequestDTO
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}