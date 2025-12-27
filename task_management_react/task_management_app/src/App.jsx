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

  // NEW: Helper to find a project by ID and jump to it
  const handleJumpToProject = (projectId) => {
    // Try to find the project in our list
    const targetProject = projects.find(p => p.id === projectId || p.projectId === projectId);
    
    if (targetProject) {
      setSelectedProject(targetProject);
      setActivePage("project-details");
    } else {
      alert("Could not find the project details. It might be archived or deleted.");
    }
  };

  if (!user) {
    return <LoginPage onLogin={(userData) => setUser(userData)} />;
  }

  const renderContent = () => {
    switch (activePage) {
      case "projects":
        return (
          <ProjectPage
            projects={projects}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onClick={handleProjectClick}
          />
        );
      case "statistics":
        return <StatisticsPage currentUserId={user.id} />;
      case "project-details":
        return (
            <ProjectDetails 
                project={selectedProject} 
                onBack={() => setActivePage("projects")}
                currentUserId={user.id} 
            />
        );
      case "add-project":
        return <AddProjectPage setActivePage={setActivePage} currentUserId={user.id} />;
      case "project-timeline":
        return <ProjectTimelinePage />;
      case "my-tasks":
         // UPDATED: We pass 'projects' and the navigation handler!
         return (
            <UserTasks 
                currentUserId={user.id} 
                projects={projects} 
                onNavigate={handleJumpToProject} 
            />
         );
      default:
        return <ProjectPage projects={projects} onClick={handleProjectClick} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col">
        <Header title={`Welcome, ${user.username}`} />
        <main className=" flex-1 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;