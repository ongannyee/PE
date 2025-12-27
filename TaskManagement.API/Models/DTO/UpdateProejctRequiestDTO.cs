namespace TaskManagement.API.Models.DTO
{
    public class UpdateProjectRequestDTO
    {
        // The unique Guid of the project to update
        public Guid Id { get; set; }
        
        public int ProjectId { get; set; }
        public required string ProjectName { get; set; }
        public required string ProjectGoal { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsArchived { get; set; }
        
        // Ownership (CreatedByUserId) is omitted here to protect data integrity.
    }
}