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

        // ==========================================
        // STANDARD CRUD OPERATIONS
        // ==========================================

        [HttpGet]
        public IActionResult GetAllTasks()
        {
            var tasks = _context.Tasks.ToList();
            var tasksDTO = tasks.Select(t => new TaskItemDTO 
            { 
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
            return Ok(task);
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

        // ==========================================
        // ASSOCIATION & RELATIONSHIP METHODS
        // ==========================================

        [HttpPost("AssignUser")]
        public IActionResult AssignUser([FromBody] TaskAssignmentDTO dto)
        {
            var assignment = new TaskAssignment { UserId = dto.UserId, TaskId = dto.TaskId };
            _context.TaskAssignments.Add(assignment);
            _context.SaveChanges();
            return Ok(new { Message = "User assigned to task successfully" });
        }

        [HttpDelete("RemoveUser")]
        public IActionResult RemoveUserFromTask([FromBody] TaskAssignmentDTO dto)
        {
            var assignment = _context.TaskAssignments
                .FirstOrDefault(ta => ta.TaskId == dto.TaskId && ta.UserId == dto.UserId);

            if (assignment == null) return NotFound("User is not assigned to this task.");

            _context.TaskAssignments.Remove(assignment);
            _context.SaveChanges();
            return Ok(new { Message = "User removed from task successfully" });
        }

        // GET: api/Task/user/{userId} personal user tab
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetMyAssignedTasks(Guid userId)
        {
            // 1. Query the bridge table for this specific user
            var assignedTasks = await _context.TaskAssignments
                .Where(ta => ta.UserId == userId)
                .Include(ta => ta.TaskItem) // Load the Task details
                .Select(ta => ta.TaskItem)  // Flatten to just the Task objects
                .ToListAsync();

            // 2. Convert to DTO (Matches the format of your GetAllTasks method)
            var tasksDTO = assignedTasks.Select(t => new TaskItemDTO 
            { 
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

        // 1. GET all Subtasks for a specific Task
        [HttpGet("{taskId:guid}/subtasks")]
        public IActionResult GetSubTasksByTask(Guid taskId)
        {
            var subtasks = _context.SubTasks
                .Where(s => s.TaskItemId == taskId)
                .Select(s => new SubTaskDTO { SubTaskId = s.SubTaskId, Title = s.Title, IsCompleted = s.IsCompleted })
                .ToList();

            return Ok(subtasks);
        }

        // 2. GET all Members (Users) assigned to a specific Task
        [HttpGet("{taskId:guid}/members")]
        public IActionResult GetTaskMembers(Guid taskId)
        {
            var members = _context.TaskAssignments
                .Where(ta => ta.TaskId == taskId)
                .Include(ta => ta.User)
                .Select(ta => new UserDTO { Id = ta.User.Id, UserId = ta.User.UserId, Username = ta.User.Username, Email = ta.User.Email })
                .ToList();

            return Ok(members);
        }

        // 3. GET all Comments for a specific Task
        [HttpGet("{taskId:guid}/comments")]
        public IActionResult GetTaskComments(Guid taskId)
        {
            var comments = _context.Comments
                .Where(c => c.TaskItemId == taskId)
                .Include(c => c.User)
                .Select(c => new CommentDTO
                {
                    CommentId = c.CommentId,
                    Text = c.Text,
                    CreatedAt = c.CreatedAt,
                    Username = c.User.Username
                })
                .ToList();

            return Ok(comments);
        }
    }
}