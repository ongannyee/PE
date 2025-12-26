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
    public class TaskController(ProjectDBContext dBContext) : ControllerBase
    {
        private readonly ProjectDBContext _context = dBContext;

        [HttpGet]
        public IActionResult GetAllTasks()
        {
            var tasks = _context.Tasks.ToList();
            var tasksDTO = tasks.Select(t => new TaskItemDTO 
            { 
                Id = t.Id,
                TaskId = t.TaskId, 
                Title = t.Title, 
                Description = t.Description, 
                Status = t.Status.ToString(), 
                Priority = t.Priority.ToString(), 
                DueDate = t.DueDate, 
                ProjectId = t.ProjectId 
            }).ToList();
            
            return Ok(tasksDTO);
        }

        [HttpGet("{taskId:int}")]
        public IActionResult GetTaskById(int taskId)
        {
            var task = _context.Tasks.FirstOrDefault(t => t.TaskId == taskId);
            if (task == null) return NotFound();
            return Ok(task);
        }

        [HttpPost]
        public IActionResult CreateTask([FromBody] CreateTaskRequestDTO createDto)
        {
            var task = new TaskItem 
            { 
                Id = Guid.NewGuid(), 
                Title = createDto.Title, 
                Description = createDto.Description, 
                Status = (Models.Domain.TaskStatus)createDto.Status, 
                Priority = (Models.Domain.TaskPriority)createDto.Priority, 
                DueDate = createDto.DueDate,
                ProjectId = createDto.ProjectId, 
                CreatedAt = DateTime.UtcNow 
            };

            _context.Tasks.Add(task);
            _context.SaveChanges();
            return Ok(task);
        }

        [HttpPut("{taskId:int}")]
        public IActionResult UpdateTask(int taskId, [FromBody] UpdateTaskRequestDTO updateDto)
        {
            var task = _context.Tasks.FirstOrDefault(t => t.TaskId == taskId);
            if (task == null) return NotFound();

            task.Title = updateDto.Title;
            task.Description = updateDto.Description;
            task.Status = (Models.Domain.TaskStatus)updateDto.Status;
            task.Priority = (Models.Domain.TaskPriority)updateDto.Priority;
            task.DueDate = updateDto.DueDate;
            
            _context.SaveChanges();
            
            return Ok(new TaskItemDTO {
                Id = task.Id,
                TaskId = task.TaskId,
                Title = task.Title,
                Status = task.Status.ToString()
            });
        }

        [HttpDelete("{taskId:int}")]
        public IActionResult DeleteTask(int taskId)
        {
            var task = _context.Tasks.FirstOrDefault(t => t.TaskId == taskId);
            if (task == null) return NotFound();

            _context.Tasks.Remove(task);
            _context.SaveChanges();
            return NoContent();
        }

        [HttpPost("AssignUser")]
        public IActionResult AssignUser([FromBody] TaskAssignmentDTO dto)
        {
            // CRITICAL: Check if the Task GUID actually exists first
            var taskExists = _context.Tasks.Any(t => t.Id == dto.TaskId);
            if (!taskExists) 
            {
                return BadRequest($"Task with GUID {dto.TaskId} does not exist.");
            }

            var exists = _context.TaskAssignments
                .Any(ta => ta.TaskId == dto.TaskId && ta.UserId == dto.UserId);
            
            if (exists) return Ok(new { Message = "User already assigned." });

            var assignment = new TaskAssignment 
            { 
                UserId = dto.UserId,
                TaskId = dto.TaskId 
            };

            try 
            {
                _context.TaskAssignments.Add(assignment);
                _context.SaveChanges();
                return Ok(new { Message = "User assigned successfully" });
            }
            catch (Exception ex)
            {
                // Return explicit inner message for debugging
                var msg = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, $"Database Error: {msg}");
            }
        }

        [HttpDelete("RemoveUser")]
        public IActionResult RemoveUserFromTask([FromBody] TaskAssignmentDTO dto)
        {
            var assignment = _context.TaskAssignments
                .FirstOrDefault(ta => ta.TaskId == dto.TaskId && ta.UserId == dto.UserId);

            if (assignment == null) return NotFound("User not found on task.");

            _context.TaskAssignments.Remove(assignment);
            _context.SaveChanges();
            return Ok(new { Message = "User removed successfully" });
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetMyAssignedTasks(Guid userId)
        {
            var assignedTasks = await _context.TaskAssignments
                .Where(ta => ta.UserId == userId)
                .Include(ta => ta.TaskItem)
                .Select(ta => ta.TaskItem)
                .ToListAsync();

            var tasksDTO = assignedTasks.Select(t => new TaskItemDTO 
            { 
                Id = t.Id,
                TaskId = t.TaskId, 
                Title = t.Title, 
                Description = t.Description, 
                Status = t.Status.ToString(), 
                Priority = t.Priority.ToString(), 
                DueDate = t.DueDate, 
                ProjectId = t.ProjectId 
            }).ToList();

            return Ok(tasksDTO);
        }

        [HttpGet("{taskId:guid}/members")]
        public IActionResult GetTaskMembers(Guid taskId)
        {
            var members = _context.TaskAssignments
                .Where(ta => ta.TaskId == taskId)
                .Include(ta => ta.User)
                .Select(ta => new UserDTO { 
                    Id = ta.User.Id, 
                    UserId = ta.User.UserId, 
                    Username = ta.User.Username, 
                    Email = ta.User.Email 
                })
                .ToList();

            return Ok(members);
        }
    }
}