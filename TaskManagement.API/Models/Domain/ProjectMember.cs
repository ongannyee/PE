using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.Models.Domain
{
    public class ProjectMember
    {
        // Association Table for Users and Projects
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid ProjectId { get; set; }
        public Project Project { get; set; } = null!;


        public string ProjectRole { get; set; } = "Contributor"; 
    }
}