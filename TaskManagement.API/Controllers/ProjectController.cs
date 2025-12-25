using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
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
        public IActionResult GetAllBProjects()
        {
            var projects = _context.Projects.ToList();
            var ProjectsDTO = new List<ProjectDTO>();
            foreach (var project in projects)
            {
                ProjectsDTO.Add (new ProjectDTO
                {
                    Id = project.Id,
                    ProjectId = project.ProjectId,
                    ProjectName = project.ProjectName,
                    ProjectGoal = project.ProjectGoal,
                    StartDate = project.StartDate,
                    EndDate = project.EndDate,
                    IsArchived = project.IsArchived

                });
            }
            return Ok(ProjectsDTO);
        }
        [HttpGet]
        [Route("{projectId:int}")]
        public IActionResult GetProjectById([FromRoute] int projectId)
        {
            var project = _context.Projects.FirstOrDefault(p => p.ProjectId == projectId);

            if (project == null)
            {
                return NotFound();
            }
            var ProjectDTO = new ProjectDTO
            {
                Id = project.Id,
                ProjectId = project.ProjectId,
                ProjectName = project.ProjectName,
                ProjectGoal = project.ProjectGoal,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                IsArchived = project.IsArchived
            };
            return Ok(ProjectDTO);
        }
        [HttpPost]
        public IActionResult AddProject([FromBody] CreateProjectRequestDTO createProjectRequestDTO)
        {
            if (createProjectRequestDTO == null)
            {
                return BadRequest("Project data is null.");
            }
            var project = new Project
            {
                Id = Guid.NewGuid(),
                ProjectId = createProjectRequestDTO.ProjectId,
                ProjectName = createProjectRequestDTO.ProjectName,
                ProjectGoal = createProjectRequestDTO.ProjectGoal,
                StartDate = createProjectRequestDTO.StartDate,
                EndDate = createProjectRequestDTO.EndDate,
                IsArchived = createProjectRequestDTO.IsArchived
            };
            _context.Projects.Add(project);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetProjectById),new {ProjectId = project.ProjectId},project);
   
        }
        [HttpPut]
        [Route("{projectId:int}")]
        public IActionResult UpdateProjectById([FromRoute] int projectId,[FromBody] UpdateProjectRequestDTO updateProjectRequestDTO)
        {
            var project = _context.Projects.FirstOrDefault(p => p.ProjectId == projectId);
            if(project == null)
            {
                return NotFound();

            }
            project.ProjectName = updateProjectRequestDTO.ProjectName;
            project.ProjectGoal = updateProjectRequestDTO.ProjectGoal;
            project.StartDate = updateProjectRequestDTO.StartDate;
            project.EndDate = updateProjectRequestDTO.EndDate;
            project.IsArchived = updateProjectRequestDTO.IsArchived;
            _context.SaveChanges();
            return Ok(project);
        }
        [HttpDelete]
        [Route("{projectId:int}")]
        public IActionResult DeleteProjectById([FromRoute] int projectId)
        {
            var project = _context.Projects.FirstOrDefault(p => p.ProjectId == projectId);
            if(project == null)
            {
                return NotFound();
            }
            _context.Projects.Remove(project);
            _context.SaveChanges();
            return NoContent();
        }

        [HttpPut]
        [Route("{projectId:int}/archive")]
        public IActionResult ArchiveProject([FromRoute] int projectId)
        {
            var project = _context.Projects.FirstOrDefault(p => p.ProjectId == projectId);
            if (project == null)
            {
                return NotFound();
            }

            project.IsArchived = true;
            _context.SaveChanges();

            return Ok(new { Message = "Project archived successfully", ProjectId = project.ProjectId });
        }
        
        // --- ASSOCIATION & RELATIONSHIP METHODS ---

        // 1. Assign User to Project
        [HttpPost("AssignUser")]
        public IActionResult AssignUserToProject([FromBody] ProjectMemberDTO dto)
        {
            var projectMember = new ProjectMember
            {
                ProjectId = dto.ProjectId,
                UserId = dto.UserId,
                //JoinedAt = DateTime.UtcNow
            };

            _context.ProjectMembers.Add(projectMember);
            _context.SaveChanges();
            return Ok(new { Message = "User assigned to project successfully." });
        }

        // 2. Remove User from Project
        [HttpDelete("RemoveUser")]
        public IActionResult RemoveUserFromProject([FromBody] ProjectMemberDTO dto)
        {
            var member = _context.ProjectMembers
                .FirstOrDefault(pm => pm.ProjectId == dto.ProjectId && pm.UserId == dto.UserId);
            
            if (member == null) return NotFound("User is not a member of this project.");

            _context.ProjectMembers.Remove(member);
            _context.SaveChanges();
            return Ok(new { Message = "User removed from project." });
        }

        // 3. Get all Members (Users) of a Project
        [HttpGet("{projectId:guid}/members")]
        public IActionResult GetProjectMembers(Guid projectId)
        {
            var members = _context.ProjectMembers
                .Where(pm => pm.ProjectId == projectId)
                .Include(pm => pm.User)
                .Select(pm => new UserDTO
                {
                    Id = pm.User.Id,
                    UserId = pm.User.UserId,
                    Username = pm.User.Username,
                    Email = pm.User.Email
                })
                .ToList();

            return Ok(members);
        }

        // 4. Get all Tasks belonging to a Project
        [HttpGet("{projectId:guid}/tasks")]
        public IActionResult GetProjectTasks(Guid projectId)
        {
            var tasks = _context.Tasks
                .Where(t => t.ProjectId == projectId)
                .Select(t => new TaskItemDTO
                {
                    TaskId = t.TaskId,
                    Title = t.Title,
                    Description = t.Description,
                    Status = t.Status.ToString(),
                    Priority = t.Priority.ToString(),
                    DueDate = t.DueDate,
                    ProjectId = t.ProjectId
                })
                .ToList();

            return Ok(tasks);
        }
    }
}