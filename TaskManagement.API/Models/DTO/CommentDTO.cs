namespace TaskManagement.API.Models.DTOs;

public class CommentDTO
{
    public int CommentId { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string Username { get; set; } = string.Empty; // Just show the name, not the whole User object
}

public class AddCommentRequestDTO
{
    public required string Text { get; set; }
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
}