using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.Models.Domain
{
    public class Comment
    {
        [Key]
        public Guid Id { get; set; }
        public int CommentId { get; set; } // Lecturer's requirement
        
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Key: Which Task does this comment belong to?
        public Guid TaskItemId { get; set; }
        public TaskItem TaskItem { get; set; } = null!;

        // Foreign Key: Who wrote this comment?
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
    }
}