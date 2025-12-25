namespace TaskManagement.API.Models.DTO;

public class ProjectMemberDTO
{
    public Guid UserId { get; set; }    // The Guid of the User
    public Guid ProjectId { get; set; } // The Guid of the Project

}