using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManagement.API.Models.Domain
{
    public class Comment
    {
        [Key]
        public Guid Id { get; set; }
        
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CommentId { get; set; } // Lecturer's requirement
        
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Key for Task
        public Guid TaskId { get; set; }
        
        [ForeignKey("TaskId")]
        public virtual TaskItem TaskItem { get; set; } = null!;

        // Foreign Key for User
        public Guid UserId { get; set; }
        
        [ForeignKey("UserId")] // This fixes the UserId1 / Unknown User issue
        public virtual User User { get; set; } = null!;
    }
}