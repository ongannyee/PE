namespace TaskManagement.API.Models.DTO
{
    public class ProjectMemberDTO
    {
        public Guid UserId { get; set; }
        public Guid ProjectId { get; set; }

        public string? Username { get; set; }
        public string? Email { get; set; }

        public required string ProjectRole { get; set; } = "Contributor"; 
    }
}