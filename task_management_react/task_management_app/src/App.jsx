import { useState, useEffect } from "react";
import { fetchUserProjects } from "./API/UserAPI";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ProjectPage from "./components/ProjectPage";
import AddProjectPage from "./components/AddProjectPage";
import ProjectTimelinePage from "./components/ProjectTimeLine";
import UserTasks from './components/UserTasks';
import ProjectDetails from "./components/ProjectDetails";
import LoginPage from "./components/LoginPage";
import StatisticsPage from "./components/StatisticsPage";

function App() {
  const [user, setUser] = useState(null); 
  const [activePage, setActivePage] = useState("projects");
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);

  // --- FIX 1: Restore Session Check on Startup ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");

    if (storedUser && storedToken) {
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("Invalid user data in storage");
            localStorage.clear();
        }
    }
  }, []);
  // ----------------------------------------------

  useEffect(() => {
    if (!user) return;
    const loadProjects = async () => {
      try {
        const data = await fetchUserProjects(user.id);
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };
    loadProjects();
  }, [user]); 

  const handleArchive = (id) => {
    setProjects(prev => prev.map(p => p.projectId === id ? { ...p, isArchived: true } : p));
  };

  const handleDelete = (id) => {
    setProjects(prev => prev.filter(p => p.projectId !== id));
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);    
    setActivePage("project-details"); 
  };

  const handleJumpToProject = (projectId) => {
    const targetProject = projects.find(p => p.id === projectId || p.projectId === projectId);
    if (targetProject) {
      setSelectedProject(targetProject);
      setActivePage("project-details");
    } else {
      alert("Could not find the project details. It might be archived or deleted.");
    }
  };

  // --- FIX 2: Add Logout Function ---
  const handleLogout = () => {
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      setUser(null);
  };
  // --------------------------------

  if (!user) {
    return <LoginPage onLogin={(userData) => setUser(userData)} />;
  }

  const renderContent = () => {
    switch (activePage) {
      case "projects":
        return <ProjectPage projects={projects} onArchive={handleArchive} onDelete={handleDelete} onClick={handleProjectClick} />;
      case "statistics":
        return <StatisticsPage currentUserId={user.id} />;
      case "project-details":
        return <ProjectDetails project={selectedProject} onBack={() => setActivePage("projects")} currentUserId={user.id} />;
      case "add-project":
        return <AddProjectPage setActivePage={setActivePage} currentUserId={user.id} />;
      case "project-timeline":
        return <ProjectTimelinePage />;
      case "my-tasks":
         return <UserTasks currentUserId={user.id} projects={projects} onNavigate={handleJumpToProject} />;
      default:
        return <ProjectPage projects={projects} onClick={handleProjectClick} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col">
        {/* Pass handleLogout to Header or a button in the layout */}
        <div className="flex justify-between items-center bg-white shadow p-4">
             <Header title={`Welcome, ${user.username}`} />
             <button onClick={handleLogout} className="text-red-500 text-sm font-bold hover:underline">Logout</button>
        </div>
        <main className=" flex-1 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;