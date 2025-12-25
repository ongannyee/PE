using Microsoft.AspNetCore.Mvc;
using TaskManagement.API.Data;
using TaskManagement.API.Models.Domain;
using TaskManagement.API.Models.DTOs;
using System.IO;

namespace TaskManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttachmentController(ProjectDBContext dBContext, IWebHostEnvironment environment) : ControllerBase
    {
        private readonly ProjectDBContext _context = dBContext;
        private readonly IWebHostEnvironment _environment = environment;

        // 1. GET: List all attachments (For Admin/Audit)
        [HttpGet]
        public IActionResult GetAllAttachments()
        {
            var attachments = _context.Attachments.ToList();
            return Ok(attachments);
        }

        // 2. POST: Upload File for a Task
        [HttpPost("upload/task/{taskId:guid}")]
        public async Task<IActionResult> UploadToTask(IFormFile file, [FromRoute] Guid taskId)
        {
            return await ProcessFileUpload(file, taskId, null);
        }

        // 3. POST: Upload File for a SubTask
        [HttpPost("upload/subtask/{subTaskId:guid}")]
        public async Task<IActionResult> UploadToSubTask(IFormFile file, [FromRoute] Guid subTaskId)
        {
            return await ProcessFileUpload(file, null, subTaskId);
        }

        // 4. DELETE: Remove Attachment and delete physical file
        [HttpDelete("{attachmentId:int}")]
        public IActionResult DeleteAttachment(int attachmentId)
        {
            var attachment = _context.Attachments.FirstOrDefault(a => a.AttachmentId == attachmentId);
            if (attachment == null) return NotFound();

            // Delete physical file from folder
            if (System.IO.File.Exists(attachment.FileUrl))
            {
                System.IO.File.Delete(attachment.FileUrl);
            }

            _context.Attachments.Remove(attachment);
            _context.SaveChanges();
            
            return NoContent();
        }

        // --- PRIVATE HELPER METHOD ---
        private async Task<IActionResult> ProcessFileUpload(IFormFile file, Guid? taskId, Guid? subTaskId)
        {
            // A. Basic Validation
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

            // B. Extension Validation (No external library needed)
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".docx", ".xlsx", ".zip" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest("File type not allowed.");
            }

            // C. Setup Directory
            var uploadsPath = Path.Combine(_environment.ContentRootPath, "Uploads");
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            // D. Generate Unique Filename to avoid overwriting
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var fullPath = Path.Combine(uploadsPath, uniqueFileName);

            // E. Save to Local Folder
            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // F. Save Record to Database
            var attachment = new Attachment
            {
                Id = Guid.NewGuid(),
                FileName = file.FileName, // Original name for the user
                FileUrl = fullPath,       // Full path for the system to find it
                TaskItemId = taskId,
                SubTaskId = subTaskId,
                UploadedAt = DateTime.UtcNow
            };

            _context.Attachments.Add(attachment);
            await _context.SaveChangesAsync();

            return Ok(attachment);
        }
    }
}