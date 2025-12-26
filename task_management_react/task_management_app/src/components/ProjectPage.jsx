import { useState, useEffect } from "react";
import { 
  fetchProjects, 
  deleteProject, 
  editProject, 
  assignUserToProject, 
  removeUserFromProject, 
  fetchProjectMembers 
} from "../API/ProjectAPI";
import ProjectSearchBar from "../components/ProjectSearchBar";
import ProjectTable from "../components/ProjectTable";
import UpdateProjectModal from "../components/UpdateProjectModal";

function ProjectPage({ onClick, currentUserId }) {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await fetchProjects();
      // Sort by Integer ProjectId
      const sorted = [...data].sort((a, b) => (a.projectId || 0) - (b.projectId || 0));
      setProjects(sorted);
      filterProjects(sorted, showArchived);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const filterProjects = (allProjects, archived) => {
    setFiltered(allProjects.filter((p) => Boolean(p.isArchived) === archived));
  };

  const handleEditClick = (project) => {
    setSelectedProject(project);
  };

  const handleProjectUpdate = async (projectIdInt, updatedDataWithMembers) => {
    try {
      const { members, ...projectData } = updatedDataWithMembers;
      const projectGuid = projectData.id; 
      
      // Update Main Info (Int ID)
      await editProject(projectIdInt, projectData);

      // Sync Members (GUID)
      const existingMembers = await fetchProjectMembers(projectGuid);
      const existingIds = existingMembers.map(m => (m.id || m.userId).toLowerCase());
      const newIds = members.map(m => m.id.toLowerCase());

      const toAdd = members.filter(m => !existingIds.includes(m.id.toLowerCase()));
      const toRemove = existingMembers.filter(m => !newIds.includes((m.id || m.userId).toLowerCase()));

      const syncPromises = [
        ...toAdd.map(user => assignUserToProject({ projectId: projectGuid, userId: user.id })),
        ...toRemove.map(user => removeUserFromProject({ projectId: projectGuid, userId: user.id }))
      ];

      await Promise.all(syncPromises);
      setSelectedProject(null);
      fetchData();
    } catch (error) {
      console.error("Sync Error:", error);
    }
  };

  return (
    <div className="relative p-4">
      <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
        <ProjectSearchBar 
          search={search} 
          setSearch={setSearch} 
          onSearch={() => filterProjects(projects, showArchived)} 
          onReset={fetchData} 
        />
        <button 
          onClick={() => { setShowArchived(!showArchived); filterProjects(projects, !showArchived); }} 
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors"
        >
          {showArchived ? "Show Active Projects" : "Show Archived Projects"}
        </button>
      </div>

      <ProjectTable 
        projects={filtered} 
        onDelete={async (id) => { await deleteProject(id); fetchData(); }} 
        onClick={onClick} 
        onEdit={handleEditClick} 
        onArchiveOrRestore={async (id) => {
           const p = projects.find(x => x.projectId === id);
           await editProject(id, { ...p, isArchived: !p.isArchived });
           fetchData();
        }} 
      />

      {selectedProject && (
        <UpdateProjectModal 
          project={selectedProject} 
          currentUserId={currentUserId} 
          onClose={() => setSelectedProject(null)} 
          onUpdate={handleProjectUpdate} 
        />
      )}
    </div>
  );
}

export default ProjectPage;