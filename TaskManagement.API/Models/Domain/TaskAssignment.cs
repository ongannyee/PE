namespace TaskManagement.API.Models.Domain
{
    public class TaskAssignment
    {
        // Link to User
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        // Link to TaskItem (The GUID 'Id')
        public Guid TaskId { get; set; } 
        public TaskItem TaskItem { get; set; } = null!;
    }
}