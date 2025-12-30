import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { fetchProjects } from "./API/ProjectAPI";

// Layout & Auth
import Layout from "./components/Layout";
import LoginPage from "./components/LoginPage";

// Pages
import ProjectPage from "./components/ProjectPage";
import AddProjectPage from "./components/AddProjectPage";
import ProjectTimelinePage from "./components/ProjectTimeLine";
import UserTasks from './components/UserTasks';
import ProjectDetails from "./components/ProjectDetails";
import StatisticsPage from "./components/StatisticsPage";


function AppContent({ user, setUser, projects, loadProjects, handleLogout }) {
  const navigate = useNavigate();

  const handleNavigateToProject = (projectId) => {
    console.log("App: Navigating to project detail page for ID:", projectId);
    if (projectId) {
      navigate(`/projects/${projectId}`);
    }
  };

  return (
    <Routes>
      {/* Main Application Layout */}
      <Route 
        path="/" 
        element={<Layout user={user} onLogout={handleLogout} />}
      >
        {/* Default Page (Dashboard/Projects) */}
        <Route 
          index 
          element={
            <ProjectPage 
              currentUserId={user.id} 
              userRole={user.role} 
              onRefresh={loadProjects} 
            />
          } 
        />

        {/* Project List */}
        <Route 
          path="projects" 
          element={
            <ProjectPage 
              currentUserId={user.id} 
              userRole={user.role} 
              onRefresh={loadProjects} 
            />
          } 
        />

        {/* Project Details with ID parameter */}
        <Route 
          path="projects/:projectId" 
          element={
            <ProjectDetails 
              currentUserId={user.id} 
              userRole={user.role}
            />
          } 
        />

        {/* Statistics */}
        <Route 
          path="statistics" 
          element={<StatisticsPage currentUserId={user.id} />} 
        />

        {/* Add Project */}
        <Route 
          path="add-project" 
          element={<AddProjectPage currentUserId={user.id} />} 
        />

        {/* Timeline */}
        <Route 
          path="timeline" 
          element={<ProjectTimelinePage />} 
        />

        {/* My Tasks */}
        <Route 
          path="my-tasks" 
          element={
            <UserTasks 
              currentUserId={user.id} 
              projects={projects} 
              onNavigate={handleNavigateToProject}
            />
          } 
        />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Auth Initialization
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
    setLoading(false);
  }, []);

  // 2. Load Projects when user is available
  useEffect(() => {
    if (user && user.id) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      const data = await fetchProjects(user.id, user.role);
      setProjects(data || []);
    } catch (err) {
      console.error("App: Failed to fetch projects", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (loading) return null;

  // If not logged in, show login page only
  if (!user) {
    return <LoginPage onLogin={(userData) => setUser(userData)} />;
  }

  return (
    <BrowserRouter>
      <AppContent 
        user={user} 
        setUser={setUser} 
        projects={projects} 
        loadProjects={loadProjects} 
        handleLogout={handleLogout} 
      />
    </BrowserRouter>
  );
}

export default App;