using Microsoft.AspNetCore.Mvc;
using TaskManagement.API.Data;
using TaskManagement.API.Models.Domain;
using System.IO;
using Microsoft.EntityFrameworkCore;

namespace TaskManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttachmentController(ProjectDBContext dBContext, IWebHostEnvironment environment) : ControllerBase
    {
        private readonly ProjectDBContext _context = dBContext;
        private readonly IWebHostEnvironment _environment = environment;

        [HttpGet]
        public async Task<IActionResult> GetAllAttachments()
        {
            var attachments = await _context.Attachments
                .Select(a => new {
                    a.Id,
                    a.FileName,
                    a.FileUrl,
                    a.TaskId,
                    a.SubTaskId,
                    a.UploadedAt,
                    a.UploadedByUserId
                })
                .ToListAsync();
            return Ok(attachments);
        }

        [HttpPost("upload/task/{taskId:guid}")]
        public async Task<IActionResult> UploadToTask(IFormFile file, [FromRoute] Guid taskId, [FromQuery] string userId)
        {
            return await ProcessFileUpload(file, taskId, null, userId);
        }

        [HttpPost("upload/subtask/{subTaskId:guid}")]
        public async Task<IActionResult> UploadToSubTask(IFormFile file, [FromRoute] Guid subTaskId, [FromQuery] string userId)
        {
            return await ProcessFileUpload(file, null, subTaskId, userId);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteAttachment(Guid id, [FromQuery] string userId)
        {
            if (!Guid.TryParse(userId, out Guid userGuid))
                return BadRequest("Invalid User ID format.");

            var attachment = await _context.Attachments
                .Include(a => a.TaskItem).ThenInclude(t => t.Project)
                .Include(a => a.SubTask).ThenInclude(st => st.TaskItem).ThenInclude(t => t.Project)
                .FirstOrDefaultAsync(a => a.Id == id);
            
            if (attachment == null) return NotFound("Attachment not found.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userGuid);
            Guid? projectCreatorId = attachment.TaskItem?.Project?.CreatedByUserId 
                                  ?? attachment.SubTask?.TaskItem?.Project?.CreatedByUserId;

            bool isFileOwner = attachment.UploadedByUserId == userGuid;
            bool isAdmin = user?.Role == "Admin";
            bool isProjectCreator = projectCreatorId == userGuid;

            if (!isFileOwner && !isAdmin && !isProjectCreator)
                return Forbid("You do not have permission to delete this file.");

            try 
            {
                var fileName = Path.GetFileName(attachment.FileUrl);
                var physicalPath = Path.Combine(_environment.ContentRootPath, "Uploads", fileName);
                if (System.IO.File.Exists(physicalPath)) System.IO.File.Delete(physicalPath);
            }
            catch (Exception ex) { Console.WriteLine($"Error: {ex.Message}"); }

            _context.Attachments.Remove(attachment);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private async Task<IActionResult> ProcessFileUpload(IFormFile file, Guid? taskId, Guid? subTaskId, string userId)
        {
            if (!Guid.TryParse(userId, out Guid userGuid)) return BadRequest("Invalid User ID.");
            if (file == null || file.Length == 0) return BadRequest("No file.");

            var uploadsFolder = "Uploads";
            var localPath = Path.Combine(_environment.ContentRootPath, uploadsFolder);
            if (!Directory.Exists(localPath)) Directory.CreateDirectory(localPath);

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var fullPhysicalPath = Path.Combine(localPath, uniqueFileName);

            using (var stream = new FileStream(fullPhysicalPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var attachment = new Attachment
            {
                Id = Guid.NewGuid(),
                FileName = file.FileName, 
                FileUrl = $"/{uploadsFolder}/{uniqueFileName}", 
                TaskId = taskId,
                SubTaskId = subTaskId,
                UploadedAt = DateTime.UtcNow,
                UploadedByUserId = userGuid
            };

            _context.Attachments.Add(attachment);
            await _context.SaveChangesAsync();

            return Ok(new {
                attachment.Id,
                attachment.FileName,
                attachment.FileUrl,
                attachment.UploadedByUserId,
                attachment.UploadedAt
            });
        }
    }
}