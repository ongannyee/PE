namespace TaskManagement.API.Models.DTO
{
    public class ProjectDTO
    {
        public Guid Id { get; set; }
        public int ProjectId { get; set; }
        public required string ProjectName { get; set; }
        public required string ProjectGoal { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsArchived { get; set; }

        // --- UPDATED TO GUID ---
        // Matches the DB Foreign Key type
        public Guid CreatedByUserId { get; set; } 

        // --- NEW PROPERTY ---
        // Allows React to show "Manager: John Doe" without extra API calls
        public string? CreatorName { get; set; }
    }
}