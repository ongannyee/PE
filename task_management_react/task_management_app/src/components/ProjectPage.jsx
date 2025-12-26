import { useState, useEffect } from "react";
import { fetchProjects, deleteProject, editProject } from "../API/ProjectAPI";
import ProjectSearchBar from "../components/ProjectSearchBar";
import ProjectTable from "../components/ProjectTable";
import UpdateProjectModal from "../components/UpdateProjectModal";

function ProjectPage({onClick}) {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  // Fetch projects on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all projects
  const fetchData = async () => {
    try {
      const data = await fetchProjects();
      const sorted = [...data].sort((a, b) => a.projectId - b.projectId);
      setProjects(sorted);
      filterProjects(sorted, showArchived);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Filter projects based on archived status
  const filterProjects = (allProjects, archived) => {
    setFiltered(allProjects.filter((p) => Boolean(p.isArchived) === archived));
  };

  // Toggle archived/active view
  const toggleArchived = () => {
    const newValue = !showArchived;
    setShowArchived(newValue);
    filterProjects(projects, newValue);
  };

  // Search projects by name
  const handleSearch = () => {
    const keyword = search.trim().toLowerCase();
    const list = projects.filter(
      (p) =>
        p.projectName.toLowerCase().includes(keyword) &&
        Boolean(p.isArchived) === showArchived
    );
    setFiltered(list);
  };

  const handleReset = () => {
    setSearch("");
    filterProjects(projects, showArchived);
  };

  // Delete project
  const handleDeleteProject = async (projectId) => {
    await deleteProject(projectId);
    const updatedProjects = projects.filter((p) => p.projectId !== projectId);
    setProjects(updatedProjects);
    filterProjects(updatedProjects, showArchived);
  };

  // Archive or restore project
  const handleArchiveOrRestore = async (projectId) => {
    try {
      // Find the project
      const project = projects.find((p) => p.projectId === projectId);
      if (!project) return;

      // Convert current value to boolean (handles true/false and 1/0)
      const currentIsArchived = Boolean(project.isArchived);
      const newIsArchivedBool = !currentIsArchived; // toggle

      // Prepare update data with all required fields
      const updateData = {
        id: project.id,
        projectId: project.projectId,
        projectName: project.projectName,
        projectGoal: project.projectGoal || "",
        startDate: project.startDate,
        endDate: project.endDate,
        // Backend expects a boolean here; DB will still store it as 1/0
        isArchived: newIsArchivedBool,
      };

      // Call API to update
      await editProject(projectId, updateData);

      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Error archiving/restoring project:", error);
    }
  };

  // Open project modal
  const handleEditClick = (project) => setSelectedProject(project);

  // Update project
  const handleProjectUpdate = async (projectId, updatedProject) => {
    await editProject(projectId, updatedProject);
    setSelectedProject(null);
    fetchData();
  };

  return (
    <div className="relative min-h-screen ">
      {/* Top bar with search and toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <ProjectSearchBar
          search={search}
          setSearch={setSearch}
          onSearch={handleSearch}
          onReset={handleReset}
        />
        <button
      onClick={toggleArchived}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm w-48 h-10 rounded"
    >
          {showArchived ? "Show Active Projects" : "Show Archived Projects"}
        </button>
      </div>

      {/* Project table */}
      <ProjectTable
        projects={filtered}
        onDelete={handleDeleteProject}
        onClick={onClick}
        onEdit={handleEditClick}
        onArchiveOrRestore={handleArchiveOrRestore}
      />

      {/* Update project modal */}
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
