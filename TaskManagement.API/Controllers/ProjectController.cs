using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskManagement.API.Data;
using TaskManagement.API.Models.Domain;
using TaskManagement.API.Models.DTO;
using TaskManagement.API.Models.DTOs;

namespace TaskManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectController(ProjectDBContext dBContext) : ControllerBase
    {
        private readonly ProjectDBContext _context = dBContext;

        [HttpGet]
        public async Task<IActionResult> GetAllBProjects()
        {
            var projects = await _context.Projects
                .Include(p => p.Creator)
                .ToListAsync();
            
            var projectsDTO = projects.Select(project => new ProjectDTO
            {
                Id = project.Id,
                ProjectId = project.ProjectId,
                ProjectName = project.ProjectName,
                ProjectGoal = project.ProjectGoal,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                IsArchived = project.IsArchived,
                CreatedByUserId = project.CreatedByUserId,
                CreatorName = project.Creator?.Username
            }).ToList();

            return Ok(projectsDTO);
        }

        [HttpGet]
        [Route("{projectId:int}")]
        public async Task<IActionResult> GetProjectById([FromRoute] int projectId)
        {
            var project = await _context.Projects
                .Include(p => p.Creator)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId);

            if (project == null) return NotFound();

            var projectDTO = new ProjectDTO
            {
                Id = project.Id,
                ProjectId = project.ProjectId,
                ProjectName = project.ProjectName,
                ProjectGoal = project.ProjectGoal,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                IsArchived = project.IsArchived,
                CreatedByUserId = project.CreatedByUserId,
                CreatorName = project.Creator?.Username
            };

            return Ok(projectDTO);
        }

        [HttpPost]
        public async Task<IActionResult> AddProject([FromBody] CreateProjectRequestDTO createProjectRequestDTO)
        {
            if (createProjectRequestDTO == null) return BadRequest("Project data is null.");

            var project = new Project
            {
                Id = Guid.NewGuid(),
                ProjectId = createProjectRequestDTO.ProjectId,
                ProjectName = createProjectRequestDTO.ProjectName,
                ProjectGoal = createProjectRequestDTO.ProjectGoal,
                StartDate = createProjectRequestDTO.StartDate,
                EndDate = createProjectRequestDTO.EndDate,
                IsArchived = createProjectRequestDTO.IsArchived,
                CreatedByUserId = createProjectRequestDTO.CreatedByUserId 
            };

            var projectMember = new ProjectMember
            {
                ProjectId = project.Id,
                UserId = createProjectRequestDTO.CreatedByUserId,
                ProjectRole = "PM" 
            };

            await _context.Projects.AddAsync(project);
            await _context.ProjectMembers.AddAsync(projectMember);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProjectById), new { projectId = project.ProjectId }, project);
        }

        [HttpPut]
        [Route("{projectId:int}")]
        public async Task<IActionResult> UpdateProjectById([FromRoute] int projectId, [FromBody] UpdateProjectRequestDTO updateProjectRequestDTO, [FromQuery] Guid currentUserId, [FromQuery] string userRole)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);
            if (project == null) return NotFound();

            if (userRole != "Admin" && project.CreatedByUserId != currentUserId)
            {
                return Forbid("You do not have permission to edit this project.");
            }

            project.ProjectName = updateProjectRequestDTO.ProjectName;
            project.ProjectGoal = updateProjectRequestDTO.ProjectGoal;
            project.StartDate = updateProjectRequestDTO.StartDate;
            project.EndDate = updateProjectRequestDTO.EndDate;
            project.IsArchived = updateProjectRequestDTO.IsArchived;

            await _context.SaveChangesAsync();
            return Ok(project);
        }

        [HttpDelete]
        [Route("{projectId:int}")]
        public async Task<IActionResult> DeleteProjectById([FromRoute] int projectId, [FromQuery] Guid currentUserId, [FromQuery] string userRole)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);
            if (project == null) return NotFound();

            if (userRole != "Admin" && project.CreatedByUserId != currentUserId)
            {
                return Forbid("You do not have permission to delete this project.");
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut]
        [Route("{projectId:int}/archive")]
        public async Task<IActionResult> ArchiveProject([FromRoute] int projectId, [FromQuery] Guid currentUserId, [FromQuery] string userRole)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);
            if (project == null) return NotFound();

            if (userRole != "Admin" && project.CreatedByUserId != currentUserId)
            {
                return Forbid("You do not have permission to archive this project.");
            }

            project.IsArchived = !project.IsArchived; // Toggle
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Project status updated successfully", ProjectId = project.ProjectId, IsArchived = project.IsArchived });
        }

        // --- ASSOCIATION & RELATIONSHIP METHODS ---

        [HttpPost("AssignUser")]
        public async Task<IActionResult> AssignUserToProject([FromBody] ProjectMemberDTO dto)
        {
            var projectMember = new ProjectMember
            {
                ProjectId = dto.ProjectId,
                UserId = dto.UserId,
                ProjectRole = dto.ProjectRole ?? "Contributor"
            };

            await _context.ProjectMembers.AddAsync(projectMember);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "User assigned to project successfully." });
        }

        [HttpDelete("RemoveUser")]
        public async Task<IActionResult> RemoveUserFromProject([FromBody] ProjectMemberDTO dto)
        {
            var member = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == dto.ProjectId && pm.UserId == dto.UserId);

            if (member == null) return NotFound("User is not a member of this project.");

            _context.ProjectMembers.Remove(member);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "User removed from project." });
        }

        [HttpGet("{projectId:guid}/members")]
        public async Task<IActionResult> GetProjectMembers(Guid projectId)
        {
            var members = await _context.ProjectMembers
                .Where(pm => pm.ProjectId == projectId)
                .Include(pm => pm.User)
                .Select(pm => new ProjectMemberDTO 
                {
                    UserId = pm.UserId,
                    ProjectId = pm.ProjectId,
                    Username = pm.User.Username,
                    Email = pm.User.Email,
                    ProjectRole = pm.ProjectRole
                })
                .ToListAsync();

            return Ok(members);
        }

        [HttpGet("{projectId:guid}/tasks")]
        public async Task<IActionResult> GetProjectTasks(Guid projectId)
        {
            var tasks = await _context.Tasks
                .Where(t => t.ProjectId == projectId)
                .Select(t => new TaskItemDTO
                {
                    Id = t.Id,
                    TaskId = t.TaskId,
                    Title = t.Title,
                    Description = t.Description,
                    Status = t.Status.ToString(),
                    Priority = t.Priority.ToString(),
                    DueDate = t.DueDate,
                    ProjectId = t.ProjectId,
                    CreatedAt = t.CreatedAt,
                    CompletedAt = t.CompletedAt
                })
                .ToListAsync();

            return Ok(tasks);
        }
    }
}