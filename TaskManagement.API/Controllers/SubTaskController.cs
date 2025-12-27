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
    public class SubTaskController(ProjectDBContext dBContext) : ControllerBase
    {
        private readonly ProjectDBContext _context = dBContext;

        // 1. GET: All subtasks with their attachments included
        [HttpGet]
        public async Task<IActionResult> GetAllSubTasks()
        {
            var subtasks = await _context.SubTasks
                .Include(s => s.Attachments) 
                .ToListAsync();
            return Ok(subtasks);
        }

        // 2. GET: Single subtask by Id with its attachments
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetSubTaskById(Guid id)
        {
            var subTask = await _context.SubTasks
                .Include(s => s.Attachments)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (subTask == null) return NotFound();
            return Ok(subTask);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSubTask([FromBody] CreateSubTaskRequestDTO dto, [FromQuery] Guid taskId)
        {
            var subTask = new SubTask 
            { 
                Id = Guid.NewGuid(), 
                Title = dto.Title, 
                IsCompleted = false, 
                TaskId = taskId 
            };
            await _context.SubTasks.AddAsync(subTask);
            await _context.SaveChangesAsync();
            return Ok(subTask);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateSubTask(Guid id, [FromBody] UpdateSubTaskRequestDTO updateDto)
        {
            var subTask = await _context.SubTasks.FirstOrDefaultAsync(s => s.Id == id);
            if (subTask == null) return NotFound();

            subTask.Title = updateDto.Title;
            subTask.IsCompleted = updateDto.IsCompleted;
            
            await _context.SaveChangesAsync();
            return Ok(subTask);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteSubTask(Guid id)
        {
            var subTask = await _context.SubTasks.FirstOrDefaultAsync(s => s.Id == id);
            if (subTask == null) return NotFound();

            _context.SubTasks.Remove(subTask);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ==========================================
        // ASSOCIATION & RELATIONSHIP METHODS
        // ==========================================

        [HttpPost("AssignUser")]
        public async Task<IActionResult> AssignUserToSubTask([FromBody] SubTaskAssignmentDTO dto)
        {
            var assignment = new SubTaskAssignment { UserId = dto.UserId, SubTaskId = dto.SubTaskId };
            await _context.SubTaskAssignments.AddAsync(assignment);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "User assigned to subtask successfully" });
        }

        [HttpDelete("RemoveUser")]
        public async Task<IActionResult> RemoveUserFromSubTask([FromBody] SubTaskAssignmentDTO dto)
        {
            var assignment = await _context.SubTaskAssignments
                .FirstOrDefaultAsync(sa => sa.SubTaskId == dto.SubTaskId && sa.UserId == dto.UserId);

            if (assignment == null) return NotFound("User is not assigned to this subtask.");

            _context.SubTaskAssignments.Remove(assignment);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "User removed from subtask successfully" });
        }

        [HttpGet("{subTaskId:guid}/members")]
        public async Task<IActionResult> GetSubTaskMembers(Guid subTaskId)
        {
            var members = await _context.SubTaskAssignments
                .Where(sa => sa.SubTaskId == subTaskId)
                .Include(sa => sa.User)
                .Select(sa => new UserDTO
                {
                    Id = sa.User.Id,
                    UserId = sa.User.UserId,
                    Username = sa.User.Username,
                    Email = sa.User.Email,
                    Role = sa.User.Role // FIXED: Added Role to resolve CS9035 build error
                })
                .ToListAsync();

            return Ok(members);
        }

        [HttpGet("{subTaskId:guid}/attachments")]
        public async Task<IActionResult> GetSubTaskAttachments(Guid subTaskId)
        {
            var attachments = await _context.Attachments
                .Where(a => a.SubTaskId == subTaskId)
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