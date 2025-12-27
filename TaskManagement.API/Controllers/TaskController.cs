using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.Models.Domain;
using TaskManagement.API.Models.DTO;
using TaskManagement.API.Models.DTOs;

namespace TaskManagement.API.Controllers
{
    [ApiController]
    [Route("api/task")] // Hardcoded to 'api/task' to match your Postman tests
    public class TaskController(ProjectDBContext dBContext) : ControllerBase
    {
        private readonly ProjectDBContext _context = dBContext;

        // ==========================================
        // STANDARD CRUD OPERATIONS
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> GetAllTasks()
        {
            var tasks = await _context.Tasks.ToListAsync();
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

        // Changed from {taskId:int} to {id:guid} to match your PK strategy
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetTaskById(Guid id)
        {
            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id);
            if (task == null) return NotFound();
            
            return Ok(new TaskItemDTO {
                Id = task.Id,
                TaskId = task.TaskId,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status.ToString(),
                Priority = task.Priority.ToString(),
                DueDate = task.DueDate,
                ProjectId = task.ProjectId
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequestDTO createDto)
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
            await _context.SaveChangesAsync();
            return Ok(task);
        }

        // Updated to use Guid PK
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdateTaskRequestDTO updateDto)
        {
            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id);
            if (task == null) return NotFound();

            var newStatus = (Models.Domain.TaskStatus)updateDto.Status;
            // If moving TO Done
            if (newStatus == Models.Domain.TaskStatus.Done && task.Status != Models.Domain.TaskStatus.Done)
            {
                task.CompletedAt = DateTime.UtcNow;
            }
            // If moving FROM Done back to ToDo/InProgress
            else if (newStatus != Models.Domain.TaskStatus.Done && task.Status == Models.Domain.TaskStatus.Done)
            {
                task.CompletedAt = null;
            }

            task.Title = updateDto.Title;
            task.Description = updateDto.Description;
            task.Status = (Models.Domain.TaskStatus)updateDto.Status;
            task.Priority = (Models.Domain.TaskPriority)updateDto.Priority;
            task.DueDate = updateDto.DueDate;
            
            await _context.SaveChangesAsync();
            
            return Ok(new TaskItemDTO {
                Id = task.Id,
                TaskId = task.TaskId,
                Title = task.Title,
                Status = task.Status.ToString(),
                CompletedAt = task.CompletedAt
            });
        }

        // Updated to use Guid PK
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id);
            if (task == null) return NotFound();

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ==========================================
        // SUBTASK & ASSIGNMENT OPERATIONS
        // ==========================================

        // This is the endpoint you were testing in Postman
        [HttpGet("{taskId:guid}/subtasks")]
        public async Task<IActionResult> GetSubTasksByTaskId(Guid taskId)
        {
            var taskExists = await _context.Tasks.AnyAsync(t => t.Id == taskId);
            if (!taskExists) return NotFound($"Task with ID {taskId} not found.");

            var subtasks = await _context.SubTasks
                .Where(s => s.TaskId == taskId)
                .OrderBy(s => s.SubTaskId)
                .Select(s => new SubTaskDTO
                {
                    Id = s.Id,
                    SubTaskId = s.SubTaskId,
                    Title = s.Title,
                    IsCompleted = s.IsCompleted
                })
                .ToListAsync();

            return Ok(subtasks);
        }

        [HttpPost("AssignUser")]
        public async Task<IActionResult> AssignUser([FromBody] TaskAssignmentDTO dto)
        {
            var taskExists = await _context.Tasks.AnyAsync(t => t.Id == dto.TaskId);
            if (!taskExists) return BadRequest("Task does not exist.");

            var exists = await _context.TaskAssignments
                .AnyAsync(ta => ta.TaskId == dto.TaskId && ta.UserId == dto.UserId);
            
            if (exists) return Ok(new { Message = "User already assigned." });

            var assignment = new TaskAssignment { UserId = dto.UserId, TaskId = dto.TaskId };
            _context.TaskAssignments.Add(assignment);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "User assigned successfully" });
        }

        [HttpDelete("RemoveUser")]
        public async Task<IActionResult> RemoveUserFromTask([FromBody] TaskAssignmentDTO dto)
        {
            var assignment = await _context.TaskAssignments
                .FirstOrDefaultAsync(ta => ta.TaskId == dto.TaskId && ta.UserId == dto.UserId);

            if (assignment == null) return NotFound("User not found on task.");

            _context.TaskAssignments.Remove(assignment);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "User removed successfully" });
        }

        [HttpGet("{taskId:guid}/members")]
        public async Task<IActionResult> GetTaskMembers(Guid taskId)
        {
            var members = await _context.TaskAssignments
                .Where(ta => ta.TaskId == taskId)
                .Include(ta => ta.User)
                .Select(ta => new UserDTO { 
                    Id = ta.User.Id, 
                    UserId = ta.User.UserId, 
                    Username = ta.User.Username, 
                    Email = ta.User.Email 
                })
                .ToListAsync();

            return Ok(members);
        }

        [HttpGet("{taskId:guid}/attachments")]
        public async Task<IActionResult> GetTaskAttachments(Guid taskId)
        {
            var taskExists = await _context.Tasks.AnyAsync(t => t.Id == taskId);
            if (!taskExists) return NotFound($"Task with ID {taskId} not found.");

            var attachments = await _context.Attachments
                .Where(a => a.TaskId == taskId)
                .Select(a => new AttachmentDTO
                {
                    Id = a.Id,
                    AttachmentId = a.AttachmentId,
                    FileName = a.FileName,
                    FileUrl = a.FileUrl,
                    UploadedAt = a.UploadedAt
                })
                .ToListAsync();

            return Ok(attachments);
        }
    }
}