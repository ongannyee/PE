using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManagement.API.Models.Domain
{
    public class Attachment
    {
        [Key]
        public Guid Id { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AttachmentId { get; set; }

        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }

        // Ownership: Track who uploaded the file using a simple Guid
        [Required]
        public Guid UploadedByUserId { get; set; }
        public User? UploadedByUser { get; set; }

        // Relationships
        public Guid? TaskId { get; set; }
        public TaskItem? TaskItem { get; set; }

        public Guid? SubTaskId { get; set; }
        public SubTask? SubTask { get; set; }
    }
}