using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.Models.Domain
{
    public class Project
    {
        // Project Data
        [Key]
        public Guid Id {get;set;}
        public int ProjectId {get;set;}
        public required string ProjectName {get;set;}
        public required string ProjectGoal {get;set;}
        public DateTime StartDate {get;set;}
        public DateTime ?EndDate{get;set;}
        public bool IsArchived {get;set;}

        // Foreign Key and Association table related
        public ICollection<TaskItem> Tasks { get; set; }= new List<TaskItem>();
        public ICollection<ProjectMember> ProjectMembers { get; set; } = new List<ProjectMember>();
    }
}