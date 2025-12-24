import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ProjectPage from "./components/ProjectPage";
import AddProjectPage from "./components/AddProjectPage";
import ProjectTimelinePage from "./components/ProjectTimeLine";

function App() {
  const [activePage, setActivePage] = useState("projects"); // default page

  // ---------------- Project state ----------------
  const [projects, setProjects] = useState([
    { projectId: 1, projectName: "Project A", isArchived: false, startDate: "2025-01-01", endDate: "2025-06-30" },
    { projectId: 2, projectName: "Project B", isArchived: false, startDate: "2025-02-01", endDate: "2025-07-31" },
    { projectId: 3, projectName: "Project C", isArchived: false, startDate: "2025-03-01", endDate: "2025-08-31" },
  ]);

  const handleArchive = (id) => {
    setProjects(prev =>
      prev.map(p => p.projectId === id ? { ...p, isArchived: true } : p)
    );
  };

  const handleDelete = (id) => {
    setProjects(prev => prev.filter(p => p.projectId !== id));
  };

  const handleClick = (project) => {
    alert(`Clicked project: ${project.projectName}`);
  };

  // ---------------- Render Pages ----------------
  const renderContent = () => {
    switch (activePage) {
      case "projects":
        return (
          <ProjectPage
            projects={projects}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onClick={handleClick}
          />
        );
      case "add-project":
        return <AddProjectPage />;
      case "project-timeline":
        return <ProjectTimelinePage />;
      default:
        return (
          <ProjectPage
            projects={projects}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onClick={handleClick}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header title="Project Management Dashboard" />

        {/* Page Content */}
        <main className=" flex-1 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;
