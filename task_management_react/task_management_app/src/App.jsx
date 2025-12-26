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

function App() {
  // 1. DEFINE ALL STATE (HOOKS) FIRST
  const [user, setUser] = useState(null); 
  const [activePage, setActivePage] = useState("projects");
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);

  // 2. DEFINE EFFECTS (HOOKS) NEXT
  // Moved this ABOVE the conditional return
  useEffect(() => {
    // Safety check: Do nothing if no user is logged in
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
  }, [user]); // Re-run if user object changes

  // 3. DEFINE HELPERS
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

  // 4. NOW WE CAN DO CONDITIONAL RENDERING (The "Gatekeeper")
  if (!user) {
    return <LoginPage onLogin={(userData) => setUser(userData)} />;
  }

  // 5. Render Main Content (Only runs if user exists)
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