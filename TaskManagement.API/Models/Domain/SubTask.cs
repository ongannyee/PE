using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.Models.Domain
{
    public class SubTask
    {
        [Key]
        public Guid Id { get; set; }
        public int SubTaskId {get; set;}
        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }

        // Foreign Key back to Task
        public Guid TaskItemId { get; set; } 
        public TaskItem TaskItem { get; set; } = null!;

        // Support for File Attachments (Usually stored as URLs or Paths)
        public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
        // Bridge for User Assignments
        public ICollection<SubTaskAssignment> SubTaskAssignments { get; set; } = new List<SubTaskAssignment>();
    }
}

