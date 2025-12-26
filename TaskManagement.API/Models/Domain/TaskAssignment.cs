namespace TaskManagement.API.Models.Domain
{
    public class TaskAssignment
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid TaskId { get; set; }
        public Guid TaskItemId { get; set; }
        public TaskItem TaskItem { get; set; } = null!;
    }
}