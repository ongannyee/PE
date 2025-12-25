namespace TaskManagement.API.Models.DTOs;

public class SubTaskDTO
{
    public int SubTaskId { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
}

public class UpdateSubTaskRequestDTO
{
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
}