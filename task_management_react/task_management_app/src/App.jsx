import { useState, useEffect } from "react";
import { fetchProjects } from "./API/ProjectAPI";
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");
    if (storedUser && storedToken) {
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            localStorage.clear();
        }
    }
  }, []);

  useEffect(() => {
    if (user && user.id) {
      loadProjects();
    }
  }, [user]); 

  const loadProjects = async () => {
    try {
      // Pass the required arguments to your API function for RBAC
      const data = await fetchProjects(user.id, user.role);
      setProjects(data || []);
    } catch (err) {
      console.error("App: Failed to fetch projects", err);
    }
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
    }
  };

  const handleLogout = () => {
      localStorage.clear();
      setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={(userData) => setUser(userData)} />;
  }

  const renderContent = () => {
    switch (activePage) {
      case "projects":
        return <ProjectPage currentUserId={user.id} userRole={user.role} onClick={handleProjectClick} onRefresh={loadProjects} />;
      case "statistics":
        return <StatisticsPage currentUserId={user.id} />;
      case "project-details":
        return <ProjectDetails project={selectedProject} onBack={() => setActivePage("projects")} currentUserId={user.id} userRole={user.role}/>;
      case "add-project":
        return <AddProjectPage setActivePage={setActivePage} currentUserId={user.id} />;
      case "project-timeline":
        return <ProjectTimelinePage />;
      case "my-tasks":
         return <UserTasks currentUserId={user.id} projects={projects} onNavigate={handleJumpToProject} />;
      default:
        return <ProjectPage currentUserId={user.id} userRole={user.role} onClick={handleProjectClick} onRefresh={loadProjects} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center bg-white shadow p-4">
             <Header title={`Welcome, ${user.username} (${user.role})`} />
             <button onClick={handleLogout} className="text-red-500 text-sm font-bold hover:underline">Logout</button>
        </div>
        <main className=" flex-1 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;