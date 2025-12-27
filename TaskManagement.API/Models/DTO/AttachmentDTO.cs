namespace TaskManagement.API.Models.DTOs
{
    public class AttachmentDTO
    {
        public Guid Id { get; set; }
        public int AttachmentId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
        
        // Changed to Guid to match the new simplified Domain Model
        public Guid UploadedByUserId { get; set; }
        
        public Guid? TaskId { get; set; }
        public Guid? SubTaskId { get; set; }
    }
}