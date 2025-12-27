namespace TaskManagement.API.Models.DTO
{
    public class ProjectMemberDTO
    {
        public Guid UserId { get; set; }
        public Guid ProjectId { get; set; }

        // To display names/emails in the UI members list
        public string? Username { get; set; }
        public string? Email { get; set; }

        // --- UPDATED WITH REQUIRED ---
        // Ensures this is always provided during mapping
        public required string ProjectRole { get; set; } = "Contributor"; 
    }
}