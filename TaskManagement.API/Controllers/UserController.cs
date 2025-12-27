using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.Models.Domain;
using TaskManagement.API.Models.DTO;
using TaskManagement.API.Models.DTOs;

namespace TaskManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController(ProjectDBContext dBContext) : ControllerBase
    {
        private readonly ProjectDBContext _context = dBContext;

        // --- STANDARD CRUD ---

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users.ToListAsync();
            var usersDTO = users.Select(u => new UserDTO 
            { 
                Id = u.Id, 
                UserId = u.UserId, 
                Username = u.Username, 
                Email = u.Email,
                Role = u.Role // Include Role
            }).ToList();
            return Ok(usersDTO);
        }

        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetUserById(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) return NotFound();
            
            return Ok(new UserDTO 
            { 
                Id = user.Id, 
                UserId = user.UserId, 
                Username = user.Username, 
                Email = user.Email,
                Role = user.Role // Include Role
            });
        }

        [HttpPost]
        public async Task<IActionResult> AddUser([FromBody] Models.DTOs.RegisterUserRequestDTO registerRequestDTO)
        {
            var user = new User { 
                Id = Guid.NewGuid(), 
                Username = registerRequestDTO.Username, 
                Email = registerRequestDTO.Email, 
                PasswordHash = registerRequestDTO.Password, 
                Role = "User", // All new registrations are default Users
                CreatedAt = DateTime.UtcNow 
            };
            
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetUserById), new { userId = user.UserId }, user);
        }

        [HttpPut("{userId:int}")]
        public async Task<IActionResult> UpdateUser(int userId, [FromBody] UpdateUserRequestDTO updateDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) return NotFound();
            
            user.Username = updateDto.Username;
            user.Email = updateDto.Email;
            
            // Note: We generally don't let users update their own Role via a standard UpdateProfile DTO
            
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        [HttpDelete("{userId:int}")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) return NotFound();
            
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --- RELATIONSHIP RETRIEVAL METHODS ---

        [HttpGet("{userId:guid}/projects")]
        public async Task<IActionResult> GetUserProjects(Guid userId)
        {
            // Logic: If user is Admin, they might want to see ALL projects.
            // However, this specific endpoint is usually for "My Projects".
            // We can add a check here if needed, but for now, we keep it to membership.
            
            var projects = await _context.ProjectMembers
                .Where(pm => pm.UserId == userId)
                .Include(pm => pm.Project)
                .ThenInclude(p => p.Creator) 
                .Select(pm => new ProjectDTO
                {
                    Id = pm.Project.Id,
                    ProjectId = pm.Project.ProjectId,
                    ProjectName = pm.Project.ProjectName,
                    ProjectGoal = pm.Project.ProjectGoal,
                    StartDate = pm.Project.StartDate,
                    EndDate = pm.Project.EndDate,
                    IsArchived = pm.Project.IsArchived,
                    CreatedByUserId = pm.Project.CreatedByUserId,
                    CreatorName = pm.Project.Creator.Username
                })
                .ToListAsync();

            return Ok(projects);
        }

        [HttpGet("{userId:guid}/tasks")]
        public async Task<IActionResult> GetUserTasks(Guid userId)
        {
            var tasks = await _context.TaskAssignments
                .Where(ta => ta.UserId == userId)
                .Include(ta => ta.TaskItem)
                .Select(ta => new TaskItemDTO
                {
                    Id = ta.TaskItem.Id,
                    TaskId = ta.TaskItem.TaskId,
                    Title = ta.TaskItem.Title,
                    Description = ta.TaskItem.Description,
                    Status = ta.TaskItem.Status.ToString(),
                    Priority = ta.TaskItem.Priority.ToString(),
                    DueDate = ta.TaskItem.DueDate,
                    ProjectId = ta.TaskItem.ProjectId
                })
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpGet("{userId:guid}/subtasks")]
        public async Task<IActionResult> GetUserSubTasks(Guid userId)
        {
            var subtasks = await _context.SubTaskAssignments
                .Where(sa => sa.UserId == userId)
                .Include(sa => sa.SubTask)
                .Select(sa => new SubTaskDTO
                {
                    SubTaskId = sa.SubTask.SubTaskId,
                    Title = sa.SubTask.Title,
                    IsCompleted = sa.SubTask.IsCompleted
                })
                .ToListAsync();

            return Ok(subtasks);
        }
    }
}