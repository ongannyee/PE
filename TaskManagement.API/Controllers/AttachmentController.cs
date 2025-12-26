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
        public IActionResult GetAllAttachments()
        {
            var attachments = _context.Attachments.ToList();
            return Ok(attachments);
        }

        [HttpPost("upload/task/{taskId:guid}")]
        public async Task<IActionResult> UploadToTask(IFormFile file, [FromRoute] Guid taskId)
        {
            return await ProcessFileUpload(file, taskId, null);
        }

        [HttpPost("upload/subtask/{subTaskId:guid}")]
        public async Task<IActionResult> UploadToSubTask(IFormFile file, [FromRoute] Guid subTaskId)
        {
            return await ProcessFileUpload(file, null, subTaskId);
        }

        // UPDATED: Now uses Guid Id for consistency with other Controllers
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteAttachment(Guid id)
        {
            // Find by the Guid Primary Key
            var attachment = await _context.Attachments.FirstOrDefaultAsync(a => a.Id == id);
            
            if (attachment == null) 
            {
                return NotFound("Attachment not found in database.");
            }

            try 
            {
                // Convert Web URL back to Physical Path for deletion
                // FileUrl is "/Uploads/unique-name.jpg"
                var fileName = Path.GetFileName(attachment.FileUrl);
                var physicalPath = Path.Combine(_environment.ContentRootPath, "Uploads", fileName);

                if (System.IO.File.Exists(physicalPath))
                {
                    System.IO.File.Delete(physicalPath);
                }
            }
            catch (Exception ex)
            {
                // Log file system error but continue to remove record from DB if needed
                Console.WriteLine($"File deletion error: {ex.Message}");
            }

            _context.Attachments.Remove(attachment);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }

        private async Task<IActionResult> ProcessFileUpload(IFormFile file, Guid? taskId, Guid? subTaskId)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".docx", ".xlsx", ".zip", ".txt" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest("File type not allowed.");
            }

            var uploadsFolder = "Uploads";
            var localPath = Path.Combine(_environment.ContentRootPath, uploadsFolder);
            
            if (!Directory.Exists(localPath))
            {
                Directory.CreateDirectory(localPath);
            }

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
                UploadedAt = DateTime.UtcNow
            };

            _context.Attachments.Add(attachment);
            await _context.SaveChangesAsync();

            return Ok(attachment);
        }
    }
}