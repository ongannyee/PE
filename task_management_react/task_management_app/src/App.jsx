import { useState, useEffect } from "react";
import { fetchUserProjects } from "./API/UserAPI";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ProjectPage from "./components/ProjectPage";
import AddProjectPage from "./components/AddProjectPage";
import ProjectTimelinePage from "./components/ProjectTimeLine";
import UserTasks from './components/UserTasks';
import ProjectDetails from "./components/ProjectDetails"; // This now includes TaskDetailModal
import LoginPage from "./components/LoginPage";

function App() {
  // 1. STATE MANAGEMENT
  const [user, setUser] = useState(null); 
  const [activePage, setActivePage] = useState("projects");
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);

  // 2. FETCH PROJECTS ON LOGIN
  useEffect(() => {
    if (!user) return;

    const loadProjects = async () => {
      try {
        // Fetch projects specifically associated with the logged-in user
        const data = await fetchUserProjects(user.id);
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };

    loadProjects();
  }, [user]);

  // 3. EVENT HANDLERS
  const handleArchive = (id) => {
    setProjects(prev => prev.map(p => p.projectId === id ? { ...p, isArchived: true } : p));
  };

  const handleDelete = (id) => {
    setProjects(prev => prev.filter(p => p.projectId !== id));
  };

  // Navigates to the details view and stores the project GUID/Object
  const handleProjectClick = (project) => {
    setSelectedProject(project);    
    setActivePage("project-details"); 
  };

  // 4. AUTHENTICATION GATEKEEPER
  if (!user) {
    return <LoginPage onLogin={(userData) => setUser(userData)} />;
  }

  // 5. NAVIGATION LOGIC (The Switch)
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
         return <UserTasks currentUserId={user.id} />;
      default:
        return <ProjectPage projects={projects} onClick={handleProjectClick} />;
    }
  };

  // 6. MAIN LAYOUT
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Pass state and setter to Sidebar so it can trigger page changes */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={`Welcome, ${user.username}`} />
        
        {/* Main viewing area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;