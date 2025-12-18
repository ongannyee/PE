import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ProjectPage from "./components/ProjectPage";
import AddProjectPage from "./components/AddProjectPage";
import ProjectTimelinePage from "./components/ProjectTimeLine";

function App() {
  const [activePage, setActivePage] = useState("projects"); // default page

  const renderContent = () => {
    switch (activePage) {
      case "projects":
        return <ProjectPage />;
      case "add-project":
        return <AddProjectPage />;
      case "project-timeline":
        return <ProjectTimelinePage/>;
      default:
        return <ProjectPage />;
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
        <main className="flex-1 p-6 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;
