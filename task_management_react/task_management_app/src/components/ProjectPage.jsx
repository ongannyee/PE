import { useState, useEffect } from "react";
import { fetchProjects, deleteProject, editProject } from "../API/ProjectAPI";
import ProjectSearchBar from "../components/ProjectSearchBar";
import ProjectTable from "../components/ProjectTable";
import UpdateProjectModal from "../components/UpdateProjectModal";

function ProjectPage() {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await fetchProjects();
      const sorted = [...data].sort((a, b) => a.projectId - b.projectId);
      setProjects(sorted);
      setFiltered(sorted);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleSearch = () => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      setFiltered(projects);
      return;
    }
    setFiltered(
      projects.filter((project) =>
        project.projectName.toLowerCase().includes(keyword)
      )
    );
  };

  const handleReset = () => {
    setSearch("");
    setFiltered(projects);
  };

  const handleDeleteProject = async (projectId) => {
    await deleteProject(projectId);
    const updatedProjects = projects.filter((p) => p.projectId !== projectId);
    setProjects(updatedProjects);
    setFiltered(updatedProjects);
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project); // open modal
  };

  const handleProjectUpdate = async (projectId, updatedProject) => {
    await editProject(projectId, updatedProject);
    setSelectedProject(null); // close modal
    fetchData(); // refresh list
  };

  return (
    <div className="relative min-h-screen">
      {/* Search bar */}
      <ProjectSearchBar
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* Project table */}
      <ProjectTable
        projects={filtered}
        onDelete={handleDeleteProject}
        onClick={handleProjectClick}
      />

      {/* Modal overlay */}
      {selectedProject && (
        <UpdateProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdate={handleProjectUpdate}
        />
      )}
    </div>
  );
}

export default ProjectPage;
