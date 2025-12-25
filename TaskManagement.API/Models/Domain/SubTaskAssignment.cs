namespace TaskManagement.API.Models.Domain
{
    public class SubTaskAssignment
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid SubTaskId { get; set; }
        public SubTask SubTask { get; set; } = null!;
    }
}