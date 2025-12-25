namespace TaskManagement.API.Models.Domain
{
    public class ProjectMember
    {
        public Guid UserId { get; set; } //Matching Guid of User
        public User User { get; set; } = null!;

        public Guid ProjectId { get; set; } //Matching Guid of Project
        public Project Project { get; set; } = null!;
    }
}