namespace TaskManagement.API.Models.DTO
{
    public class UpdateProjectRequestDTO
    {
        public Guid Id {get;set;}
        public int ProjectId {get;set;}
        public required string ProjectName {get;set;}
        public required string ProjectGoal {get;set;}
        public DateTime StartDate {get;set;}
        public DateTime ?EndDate{get;set;}
        public required string ArchivedName {get;set;}


    }
}