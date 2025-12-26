namespace TaskManagement.API.Models.DTOs;

public class SubTaskDTO
{
    public Guid Id { get; set; }
    public int SubTaskId { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
}

public class CreateSubTaskRequestDTO
{
    public string Title { get; set; } = string.Empty;
}

public class UpdateSubTaskRequestDTO
{
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
}