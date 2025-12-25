using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.Models.Domain
{
   public class Attachment
    {
        [Key]
        public Guid Id { get; set; }
        public int AttachmentId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;

        // Foreign Key back to SubTask
        public Guid SubTaskId { get; set; }
        public SubTask SubTask { get; set; } = null!;
    }
}