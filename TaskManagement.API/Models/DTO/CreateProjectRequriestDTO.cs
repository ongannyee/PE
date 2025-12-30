namespace TaskManagement.API.Models.DTO
{
    public class CreateProjectRequestDTO
    {
        public Guid Id { get; set; }
        public int ProjectId { get; set; }
        public required string ProjectName { get; set; }
        public required string ProjectGoal { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsArchived { get; set; }

        public required Guid CreatedByUserId { get; set; } 
    }
}