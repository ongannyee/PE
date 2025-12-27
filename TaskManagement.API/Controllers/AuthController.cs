using Microsoft.AspNetCore.Mvc;
using TaskManagement.API.Data;
using TaskManagement.API.Models.Domain;
using TaskManagement.API.Models.DTO;
using System.Security.Claims;               // REQUIRED FOR JWT
using Microsoft.IdentityModel.Tokens;       // REQUIRED FOR JWT
using System.IdentityModel.Tokens.Jwt;      // REQUIRED FOR JWT
using System.Text;                          // REQUIRED FOR JWT

namespace TaskManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(ProjectDBContext context, IConfiguration configuration) : ControllerBase
    {
        private readonly ProjectDBContext _context = context;
        private readonly IConfiguration _configuration = configuration;

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequestDTO request)
        {
            if (_context.Users.Any(u => u.Email == request.Email))
            {
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
            // 1. Find user
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);

            if (user == null || user.PasswordHash != request.Password)
            {
                return Unauthorized("Invalid email or password.");
            }

            // --- 2. GENERATE TOKEN (The part that was missing) ---
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim("UserId", user.UserId.ToString()), 
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            // 3. Return Token + User
            return Ok(new 
            { 
                Token = tokenString, 
                User = new 
                { 
                    Id = user.Id, 
                    Username = user.Username, 
                    Email = user.Email 
                } 
            });
        }
    }
}