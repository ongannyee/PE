using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.Models.Domain;

public class User
{
    // User data
    [Key]
    public Guid Id { get; set; }
    public int UserId {get; set;}
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign key related
    public ICollection<ProjectMember> ProjectMembers { get; set; } = new List<ProjectMember>();
    public ICollection<TaskAssignment> TaskAssignments { get; set; } = new List<TaskAssignment>();
    public ICollection<SubTaskAssignment> SubTaskAssignments { get; set; } = new List<SubTaskAssignment>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}