using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.Models.Domain;
using TaskManagement.API.Models.DTOs;

namespace TaskManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController(ProjectDBContext dBContext) : ControllerBase
    {
        private readonly ProjectDBContext _context = dBContext;

        [HttpGet]
        public async Task<IActionResult> GetAllComments()
        {
            var comments = await _context.Comments
                .Include(c => c.User)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CommentDTO
                {
                    CommentId = c.CommentId,
                    Text = c.Text,
                    CreatedAt = c.CreatedAt,
                    Username = c.User != null ? c.User.Username : "Unknown User",
                    UserId = c.UserId
                })
                .ToListAsync();
            return Ok(comments);
        }

        [HttpGet("task/{taskId:guid}")]
        public async Task<IActionResult> GetCommentsByTask(Guid taskId)
        {
            var comments = await _context.Comments
                .Include(c => c.User)
                .Where(c => c.TaskId == taskId)
                .OrderBy(c => c.CreatedAt) 
                .Select(c => new CommentDTO
                {
                    CommentId = c.CommentId,
                    Text = c.Text,
                    CreatedAt = c.CreatedAt,
                    Username = c.User != null ? c.User.Username : "Unknown User",
                    UserId = c.UserId
                })
                .ToListAsync();

            return Ok(comments);
        }

        [HttpPost]
        public async Task<IActionResult> AddComment([FromBody] AddCommentRequestDTO commentRequest)
        {
            if (commentRequest == null) return BadRequest("Invalid comment data.");

            var author = await _context.Users.FindAsync(commentRequest.UserId);
            if (author == null) return BadRequest("Author not found.");

            var comment = new Comment
            {
                Id = Guid.NewGuid(),
                Text = commentRequest.Text,
                CreatedAt = DateTime.UtcNow,
                TaskId = commentRequest.TaskId,
                UserId = commentRequest.UserId
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            var response = new CommentDTO {
                CommentId = comment.CommentId,
                Text = comment.Text,
                CreatedAt = comment.CreatedAt,
                Username = author.Username,
                UserId = comment.UserId
            };

            return Ok(response);
        }

        [HttpPut("{commentId:int}")]
        public async Task<IActionResult> UpdateComment(int commentId, [FromBody] string text)
        {
            var comment = await _context.Comments.FirstOrDefaultAsync(c => c.CommentId == commentId);
            if (comment == null) return NotFound();
            comment.Text = text;
            await _context.SaveChangesAsync();
            return Ok(comment);
        }

        [HttpDelete("{commentId:int}")]
        public async Task<IActionResult> DeleteComment(int commentId)
        {
            var comment = await _context.Comments.FirstOrDefaultAsync(c => c.CommentId == commentId);
            if (comment == null) return NotFound();
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}