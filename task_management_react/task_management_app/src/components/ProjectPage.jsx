import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

function ProjectPage({ currentUserId, userRole, onRefresh }) {
  const navigate = useNavigate();
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

  // Live Search Effect: Filters as you type
  useEffect(() => {
    applyFilter(projects, showArchived, search);
  }, [search, showArchived, projects]);

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
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (allProjects, isShowingArchived, searchText) => {
    const query = (searchText || "").toLowerCase().trim();
    
    const filteredList = allProjects.filter((p) => {
      const archivedVal = p.isArchived ?? p.IsArchived ?? false;
      const matchesArchive = Boolean(archivedVal) === isShowingArchived;
      
      const projectName = (p.projectName || p.ProjectName || "").toLowerCase();
      const projectGoal = (p.projectGoal || p.ProjectGoal || "").toLowerCase();
      const matchesSearch = query === "" || projectName.includes(query) || projectGoal.includes(query);
      
      return matchesArchive && matchesSearch;
    });
    
    setFiltered(filteredList);
  };

  const handleReset = () => {
    setSearch("");
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

  const handleProjectClick = (project) => {
    const pId = project.id || project.projectId || project.ProjectId;
    navigate(`/projects/${pId}`);
  };

  const handleProjectUpdate = async (projectIdInt, updatedDataWithMembers) => {
    try {
      const { members, ...projectData } = updatedDataWithMembers;
      await editProject(projectIdInt, projectData, currentUserId, userRole);
      const projectGuid = projectData.id || projectData.Id; 
      const existingMembersRaw = await fetchProjectMembers(projectGuid);
      
      const existingIds = existingMembersRaw.map(m => (m.userId || m.id || m.UserId || "").toString().toLowerCase());
      const newIds = members.map(m => (m.id || m.userId || "").toString().toLowerCase());

      const toAdd = members.filter(m => !existingIds.includes((m.id || m.userId || "").toString().toLowerCase()));
      const toRemove = existingMembersRaw.filter(m => {
        const mid = (m.userId || m.id || m.UserId || "").toString().toLowerCase();
        return !newIds.includes(mid);
      });

      await Promise.all([
        ...toAdd.map(user => 
          assignUserToProject({ 
            projectId: projectGuid, 
            userId: user.id, 
            projectRole: "Contributor" 
          })
        ),
        ...toRemove.map(user => {
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
      alert("Failed to update project members.");
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
    <div className="relative p-8 bg-slate-50 min-h-screen font-sans">
      {/* Title Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Dashboard</h1>
        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em] mt-1">
          Manage and track your active workspace
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        {/* Search Bar handles text input */}
        <div className="flex-1 w-full">
          <ProjectSearchBar 
            search={search} 
            setSearch={setSearch} 
            onSearch={() => {}} 
            onReset={handleReset} 
          />
        </div>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setShowArchived(!showArchived)} 
          className="bg-white text-slate-900 border border-slate-200 px-6 py-3 rounded-xl shadow-sm hover:bg-slate-50 transition-all h-fit flex items-center gap-3 group"
        >
          <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-600 group-hover:text-blue-600 transition-colors">
            {showArchived ? "View Active Projects" : "View Archive"}
          </span>
          <span className="text-slate-200">|</span>
          <span className="text-sm">{showArchived ? "📂" : "📦"}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-blue-600 border-t-transparent"></div>
          <span className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Workspace...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-white shadow-sm">
           <div className="text-4xl mb-4">🔍</div>
           <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
             {search ? `No matches for "${search}"` : "Empty Workspace"}
           </p>
           {search && (
             <button onClick={handleReset} className="text-blue-600 text-[10px] font-black uppercase tracking-widest mt-4 hover:underline">
               Clear Search
             </button>
           )}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <ProjectTable 
            projects={filtered} 
            currentUserId={currentUserId} 
            userRole={userRole} 
            onDelete={handleDelete} 
            onClick={handleProjectClick} 
            onEdit={handleEditClick} 
            onArchiveOrRestore={handleArchiveToggle} 
          />
        </div>
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