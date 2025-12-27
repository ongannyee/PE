namespace TaskManagement.API.Models.DTOs;

public class TaskItemDTO
{
    public Guid Id { get; set; }
    public int TaskId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty; // Converted Enum to String for frontend
    public string Priority { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public Guid ProjectId { get; set; }
}

public class CreateTaskRequestDTO
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public int Status { get; set; } // Send as int (0, 1, 2)
    public int Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public Guid ProjectId { get; set; }
}

public class UpdateTaskRequestDTO
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Status { get; set; }
    public int Priority { get; set; }
    public DateTime? DueDate { get; set; }
}