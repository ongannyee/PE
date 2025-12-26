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
        public IActionResult GetAllSubTasks()
        {
            var subtasks = _context.SubTasks
                .Include(s => s.Attachments) // Ensures attachments are returned in the JSON
                .ToList();
            return Ok(subtasks);
        }

        // 2. GET: Single subtask by Id with its attachments
        [HttpGet("{id:guid}")]
        public IActionResult GetSubTaskById(Guid id)
        {
            var subTask = _context.SubTasks
                .Include(s => s.Attachments)
                .FirstOrDefault(s => s.Id == id);

            if (subTask == null) return NotFound();
            return Ok(subTask);
        }

        [HttpPost]
        public IActionResult CreateSubTask([FromBody] CreateSubTaskRequestDTO dto, [FromQuery] Guid taskId)
        {
            var subTask = new SubTask 
            { 
                Id = Guid.NewGuid(), 
                Title = dto.Title, 
                IsCompleted = false, 
                TaskId = taskId 
            };
            _context.SubTasks.Add(subTask);
            _context.SaveChanges();
            return Ok(subTask);
        }

        [HttpPut("{id:guid}")]
        public IActionResult UpdateSubTask(Guid id, [FromBody] UpdateSubTaskRequestDTO updateDto)
        {
            var subTask = _context.SubTasks.FirstOrDefault(s => s.Id == id);
            if (subTask == null) return NotFound();

            subTask.Title = updateDto.Title;
            subTask.IsCompleted = updateDto.IsCompleted;
            
            _context.SaveChanges();
            return Ok(subTask);
        }

        [HttpDelete("{id:guid}")]
        public IActionResult DeleteSubTask(Guid id)
        {
            var subTask = _context.SubTasks.FirstOrDefault(s => s.Id == id);
            if (subTask == null) return NotFound();

            _context.SubTasks.Remove(subTask);
            _context.SaveChanges();
            return NoContent();
        }

        // ==========================================
        // ASSOCIATION & RELATIONSHIP METHODS
        // ==========================================

        [HttpPost("AssignUser")]
        public IActionResult AssignUserToSubTask([FromBody] SubTaskAssignmentDTO dto)
        {
            var assignment = new SubTaskAssignment { UserId = dto.UserId, SubTaskId = dto.SubTaskId };
            _context.SubTaskAssignments.Add(assignment);
            _context.SaveChanges();
            return Ok(new { Message = "User assigned to subtask successfully" });
        }

        [HttpDelete("RemoveUser")]
        public IActionResult RemoveUserFromSubTask([FromBody] SubTaskAssignmentDTO dto)
        {
            var assignment = _context.SubTaskAssignments
                .FirstOrDefault(sa => sa.SubTaskId == dto.SubTaskId && sa.UserId == dto.UserId);

            if (assignment == null) return NotFound("User is not assigned to this subtask.");

            _context.SubTaskAssignments.Remove(assignment);
            _context.SaveChanges();
            return Ok(new { Message = "User removed from subtask successfully" });
        }

        [HttpGet("{subTaskId:guid}/members")]
        public IActionResult GetSubTaskMembers(Guid subTaskId)
        {
            var members = _context.SubTaskAssignments
                .Where(sa => sa.SubTaskId == subTaskId)
                .Include(sa => sa.User)
                .Select(sa => new UserDTO
                {
                    Id = sa.User.Id,
                    UserId = sa.User.UserId,
                    Username = sa.User.Username,
                    Email = sa.User.Email
                })
                .ToList();

            return Ok(members);
        }

        [HttpGet("{subTaskId:guid}/attachments")]
        public IActionResult GetSubTaskAttachments(Guid subTaskId)
        {
            var attachments = _context.Attachments
                .Where(a => a.SubTaskId == subTaskId)
                .Select(a => new AttachmentDTO
                {
                    Id = a.Id,
                    AttachmentId = a.AttachmentId,
                    FileName = a.FileName,
                    FileUrl = a.FileUrl,
                    UploadedAt = a.UploadedAt
                })
                .ToList();

            return Ok(attachments);
        }
    }
}