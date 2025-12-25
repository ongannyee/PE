namespace TaskManagement.API.Models.DTOs
{
    public class AttachmentDTO
    {
        public Guid Id { get; set; }
        public int AttachmentId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty; // Required for your GET query
        public DateTime UploadedAt { get; set; }
        public Guid? TaskItemId { get; set; }
        public Guid? SubTaskId { get; set; }
    }
}