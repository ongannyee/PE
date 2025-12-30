namespace TaskManagement.API.Models.Domain
{
    public class TaskAssignment
    {
        // Association Table for Users and TaskItems
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid TaskId { get; set; } 
        public TaskItem TaskItem { get; set; } = null!;
    }
}