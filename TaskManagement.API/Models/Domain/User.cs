using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.Models.Domain;

public class User
{
    // User data
    [Key]
    public Guid Id { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Projects this specific user created/owns
    public ICollection<Project> OwnedProjects { get; set; } = new List<Project>();

    // --- ADDED THIS ---
    // Files uploaded by this user
    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();

    // Foreign key related
    public ICollection<ProjectMember> ProjectMembers { get; set; } = new List<ProjectMember>();
    public ICollection<TaskAssignment> TaskAssignments { get; set; } = new List<TaskAssignment>();
    public ICollection<SubTaskAssignment> SubTaskAssignments { get; set; } = new List<SubTaskAssignment>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}