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

function ProjectPage({ onClick, currentUserId, userRole, onRefresh }) {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUserId && userRole) {
      fetchData();
    }
  }, [currentUserId, userRole]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchProjects(currentUserId, userRole);
      
      const projectList = Array.isArray(data) ? data : [];
      const sorted = [...projectList].sort((a, b) => {
        const idA = a.projectId || a.ProjectId || a.id || 0;
        const idB = b.projectId || b.ProjectId || b.id || 0;
        return idA - idB;
      });

      setProjects(sorted);
      applyFilter(sorted, showArchived);
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (allProjects, isShowingArchived) => {
    const filteredList = allProjects.filter((p) => {
      const archivedVal = p.isArchived ?? p.IsArchived ?? false;
      return Boolean(archivedVal) === isShowingArchived;
    });
    setFiltered(filteredList);
  };

  const canManage = (project) => {
    if (userRole === "Admin") return true;
    const creatorId = (project.createdByUserId || project.CreatedByUserId || "").toLowerCase();
    const myId = (currentUserId || "").toLowerCase();
    return creatorId === myId && myId !== "";
  };

  const handleEditClick = (project) => {
    if (canManage(project)) {
      setSelectedProject(project);
    } else {
      alert("Permission Denied: Only Admin or the Project Manager can edit.");
    }
  };

  const handleProjectUpdate = async (projectIdInt, updatedDataWithMembers) => {
    try {
      const { members, ...projectData } = updatedDataWithMembers;
      
      // 1. Update core project details
      await editProject(projectIdInt, projectData, currentUserId, userRole);
      
      const projectGuid = projectData.id || projectData.Id; 
      
      // 2. Fetch current state from DB to compare
      const existingMembersRaw = await fetchProjectMembers(projectGuid);
      
      // Normalize IDs for comparison
      const existingIds = existingMembersRaw.map(m => (m.userId || m.id || m.UserId || "").toString().toLowerCase());
      const newIds = members.map(m => (m.id || m.userId || "").toString().toLowerCase());

      // 3. Determine who to Add and who to Remove
      const toAdd = members.filter(m => !existingIds.includes((m.id || m.userId || "").toString().toLowerCase()));
      
      const toRemove = existingMembersRaw.filter(m => {
        const mid = (m.userId || m.id || m.UserId || "").toString().toLowerCase();
        return !newIds.includes(mid);
      });

      // 4. Execute API calls for membership changes
      await Promise.all([
        ...toAdd.map(user => 
          assignUserToProject({ 
            projectId: projectGuid, 
            userId: user.id, 
            projectRole: "Contributor" 
          })
        ),
        ...toRemove.map(user => {
          // CRITICAL: Ensure we use the correct property for the ID here
          const uid = user.userId || user.id || user.UserId;
          return removeUserFromProject({ 
            projectId: projectGuid, 
            userId: uid 
          });
        })
      ]);

      setSelectedProject(null);
      fetchData();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update project members. Please check console for details.");
    }
  };

  const handleDelete = async (id) => {
    const p = projects.find(x => (x.projectId || x.ProjectId || x.id) === id);
    if (canManage(p) && window.confirm("Delete project?")) {
      await deleteProject(id, currentUserId, userRole); 
      fetchData(); 
      if (onRefresh) onRefresh();
    }
  };

  const handleArchiveToggle = async (id) => {
    const p = projects.find(x => (x.projectId || x.ProjectId || x.id) === id);
    if (canManage(p)) {
      const currentStatus = p.isArchived ?? p.IsArchived ?? false;
      await editProject(id, { ...p, isArchived: !currentStatus }, currentUserId, userRole);
      fetchData();
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div className="relative p-4">
      <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
        <ProjectSearchBar 
          search={search} 
          setSearch={setSearch} 
          onSearch={() => applyFilter(projects, showArchived)} 
          onReset={fetchData} 
        />
        <button 
          onClick={() => { 
            const newMode = !showArchived;
            setShowArchived(newMode); 
            applyFilter(projects, newMode); 
          }} 
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors"
        >
          {showArchived ? "Show Active Projects" : "Show Archived Projects"}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 font-medium">Loading projects...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-20 text-center border-2 border-dashed rounded-lg bg-gray-50">
           <p className="text-gray-500 text-lg">No projects found.</p>
        </div>
      ) : (
        <ProjectTable 
          projects={filtered} 
          currentUserId={currentUserId} 
          userRole={userRole} 
          onDelete={handleDelete} 
          onClick={onClick} 
          onEdit={handleEditClick} 
          onArchiveOrRestore={handleArchiveToggle} 
        />
      )}

      {selectedProject && (
        <UpdateProjectModal 
          project={selectedProject} 
          currentUserId={currentUserId} 
          userRole={userRole}
          onClose={() => setSelectedProject(null)} 
          onUpdate={handleProjectUpdate} 
        />
      )}
    </div>
  );
}

export default ProjectPage;