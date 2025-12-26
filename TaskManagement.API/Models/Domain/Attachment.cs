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

        // Allows a file to be attached to either a Task or a SubTask
        public Guid? TaskId { get; set; }
        public TaskItem? TaskItem { get; set; }

        public Guid? SubTaskId { get; set; }
        public SubTask? SubTask { get; set; }
    }
}