using Microsoft.AspNetCore.Mvc;
using TaskManagement.API.Data;
using TaskManagement.API.Models.Domain;
using TaskManagement.API.Models.DTO;

namespace TaskManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(ProjectDBContext context) : ControllerBase
    {
        private readonly ProjectDBContext _context = context;

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequestDTO request)
    {
        // 1. Check if user already exists
        if (_context.Users.Any(u => u.Email == request.Email))
        {
            // OLD: return BadRequest("Email already exists.");  <-- This caused the crash
            // NEW: Return JSON object
            return BadRequest(new { Message = "Email already exists." });
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            Email = request.Email,
            PasswordHash = request.Password, 
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        _context.SaveChanges();

        return Ok(new { Message = "User registered successfully!" });
    }

        // POST: api/Auth/login
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequestDTO request)
        {
            // 1. Find user by email
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);

            if (user == null)
            {
                return Unauthorized("Invalid email.");
            }

            // 2. Check password (Simple string comparison for now)
            if (user.PasswordHash != request.Password)
            {
                return Unauthorized("Invalid password.");
            }

            // 3. Login Success! Return the User Info (ID is crucial here)
            return Ok(new 
            { 
                Id = user.Id, 
                Username = user.Username, 
                Email = user.Email 
            });
        }
    }
}