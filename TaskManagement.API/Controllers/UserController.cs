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
        public IActionResult GetAllUsers()
        {
            var users = _context.Users.ToList();
            var usersDTO = users.Select(u => new UserDTO 
            { 
                Id = u.Id, 
                UserId = u.UserId, 
                Username = u.Username, 
                Email = u.Email 
            }).ToList();
            return Ok(usersDTO);
        }

        [HttpGet("{userId:int}")]
        public IActionResult GetUserById(int userId)
        {
            var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
            if (user == null) return NotFound();
            return Ok(new UserDTO { Id = user.Id, UserId = user.UserId, Username = user.Username, Email = user.Email });
        }

        [HttpPost]
        public IActionResult AddUser([FromBody] RegisterUserRequestDTO registerRequestDTO)
        {
            var user = new User { 
                Id = Guid.NewGuid(), 
                Username = registerRequestDTO.Username, 
                Email = registerRequestDTO.Email, 
                PasswordHash = registerRequestDTO.Password, 
                CreatedAt = DateTime.UtcNow 
            };
            _context.Users.Add(user);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetUserById), new { userId = user.UserId }, user);
        }

        [HttpPut("{userId:int}")]
        public IActionResult UpdateUser(int userId, [FromBody] UpdateUserRequestDTO updateDto)
        {
            var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
            if (user == null) return NotFound();
            user.Username = updateDto.Username;
            user.Email = updateDto.Email;
            _context.SaveChanges();
            return Ok(user);
        }

        [HttpDelete("{userId:int}")]
        public IActionResult DeleteUser(int userId)
        {
            var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
            if (user == null) return NotFound();
            _context.Users.Remove(user);
            _context.SaveChanges();
            return NoContent();
        }

        // --- RELATIONSHIP RETRIEVAL METHODS ---

        // 1. Get all Projects a User is a member of
        [HttpGet("{userId:guid}/projects")]
        public IActionResult GetUserProjects(Guid userId)
        {
            var projects = _context.ProjectMembers
                .Where(pm => pm.UserId == userId)
                .Include(pm => pm.Project)
                .Select(pm => new ProjectDTO
                {
                    Id = pm.Project.Id,
                    ProjectId = pm.Project.ProjectId,
                    ProjectName = pm.Project.ProjectName,
                    ProjectGoal = pm.Project.ProjectGoal,
                    StartDate = pm.Project.StartDate,
                    EndDate = pm.Project.EndDate,
                    IsArchived = pm.Project.IsArchived
                })
                .ToList();

            return Ok(projects);
        }

        // 2. Get all Tasks assigned to a User
        [HttpGet("{userId:guid}/tasks")]
        public IActionResult GetUserTasks(Guid userId)
        {
            var tasks = _context.TaskAssignments
                .Where(ta => ta.UserId == userId)
                .Include(ta => ta.TaskItem)
                .Select(ta => new TaskItemDTO
                {
                    TaskId = ta.TaskItem.TaskId,
                    Title = ta.TaskItem.Title,
                    Description = ta.TaskItem.Description,
                    Status = ta.TaskItem.Status.ToString(),
                    Priority = ta.TaskItem.Priority.ToString(),
                    DueDate = ta.TaskItem.DueDate,
                    ProjectId = ta.TaskItem.ProjectId
                })
                .ToList();

            return Ok(tasks);
        }

        // 3. Get all Subtasks assigned to a User
        [HttpGet("{userId:guid}/subtasks")]
        public IActionResult GetUserSubTasks(Guid userId)
        {
            var subtasks = _context.SubTaskAssignments
                .Where(sa => sa.UserId == userId)
                .Include(sa => sa.SubTask)
                .Select(sa => new SubTaskDTO
                {
                    SubTaskId = sa.SubTask.SubTaskId,
                    Title = sa.SubTask.Title,
                    IsCompleted = sa.SubTask.IsCompleted
                })
                .ToList();

            return Ok(subtasks);
        }
    }
}