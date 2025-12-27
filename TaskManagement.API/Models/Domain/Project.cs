using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManagement.API.Models.Domain
{
    public class Project
    {
        [Key]
        public Guid Id { get; set; }
        public int ProjectId { get; set; }
        public required string ProjectName { get; set; }
        public required string ProjectGoal { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsArchived { get; set; }

        // --- THE FOREIGN KEY ---
        public required Guid CreatedByUserId { get; set; } 

        // --- THE NAVIGATION PROPERTY ---
        [ForeignKey("CreatedByUserId")]
        public User Creator { get; set; } = null!;

        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
        public ICollection<ProjectMember> ProjectMembers { get; set; } = new List<ProjectMember>();
    }
}