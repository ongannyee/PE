using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.Models.Domain
{

    public enum TaskStatus
    {
        ToDo,
        InProgress,
        Done
    }

    public enum TaskPriority
    {
        Low,
        Medium,
        High,
        Urgent
    }

    public class TaskItem
    {
        [Key]
        public Guid Id {get;set;}
        public int TaskId {get;set;}
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        
        // Status and Priority
        public TaskStatus Status { get; set; } = TaskStatus.ToDo;
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
        
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Key to Project
        public Guid ProjectId { get; set; }
        public Project Project { get; set; } = null!;

        // Support for Subtasks
        public ICollection<SubTask> SubTasks { get; set; } = new List<SubTask>();

        // Bridge to assigned Users
        public ICollection<TaskAssignment> TaskAssignments { get; set; } = new List<TaskAssignment>();
        public ICollection<Attachment> TaskAttachments { get; set; } = new List<Attachment>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}