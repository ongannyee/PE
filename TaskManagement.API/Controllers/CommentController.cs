using Microsoft.AspNetCore.Mvc;
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
        public IActionResult GetAllComments()
        {
            return Ok(_context.Comments.ToList());
        }

        [HttpGet("task/{taskId:guid}")]
        public IActionResult GetCommentsByTask(Guid taskId)
        {
            var comments = _context.Comments.Where(c => c.TaskItemId == taskId).ToList();
            return Ok(comments);
        }

        [HttpPost]
        public IActionResult AddComment([FromBody] AddCommentRequestDTO commentRequest)
        {
            var comment = new Comment
            {
                Id = Guid.NewGuid(),
                Text = commentRequest.Text,
                CreatedAt = DateTime.UtcNow,
                TaskItemId = commentRequest.TaskItemId,
                UserId = commentRequest.UserId
            };
            _context.Comments.Add(comment);
            _context.SaveChanges();
            return Ok(comment);
        }

        [HttpPut("{commentId:int}")]
        public IActionResult UpdateComment(int commentId, [FromBody] string text)
        {
            var comment = _context.Comments.FirstOrDefault(c => c.CommentId == commentId);
            if (comment == null) return NotFound();
            comment.Text = text;
            _context.SaveChanges();
            return Ok(comment);
        }

        [HttpDelete("{commentId:int}")]
        public IActionResult DeleteComment(int commentId)
        {
            var comment = _context.Comments.FirstOrDefault(c => c.CommentId == commentId);
            if (comment == null) return NotFound();
            _context.Comments.Remove(comment);
            _context.SaveChanges();
            return NoContent();
        }
    }
}