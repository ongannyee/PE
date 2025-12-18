using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using TaskManagement.API.Data;
using TaskManagement.API.Models.Domain;
using TaskManagement.API.Models.DTO;

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
                    ArchivedName = project.ArchivedName

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
                ArchivedName = project.ArchivedName
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
                ArchivedName = createProjectRequestDTO.ArchivedName
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
            project.ArchivedName = updateProjectRequestDTO.ArchivedName;
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
    }
}