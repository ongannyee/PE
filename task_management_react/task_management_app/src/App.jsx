import { useState, useEffect } from "react";
import { fetchProjects, deleteProject } from "./API/ProjectAPI";
import AddProject from "./components/AddProject";
import ProjectSearchBar from "./components/ProjectSearchBar";
import ProjectTable from "./components/ProjectTable";

function App() {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchData();
  });

  const handleSearch = () => {
    const sorted = [...projects].sort((a, b) => a.projectId - b.projectId);
    setFiltered(
      sorted.filter((project) =>
        project.title.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  const fetchData = async () => {
    try {
      const data = await fetchProjects();
      const sorted = [...data].sort((a, b) => a.projectId - b.projectId);
      setProjects(sorted);
      setFiltered(sorted);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    await deleteProject(projectId);
    const updatedProjects = projects.filter((b) => b.projectId !== projectId);
    setProjects(updatedProjects);
    setFiltered(updatedProjects);
  };

  const handleReset = () => {
    setSearch("");
    setFiltered(projects);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-700">
        Project Store
      </h1>
      <ProjectSearchBar
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
        onReset={handleReset}
      />
      <ProjectTable projects={filtered} onDelete={handleDeleteProject} />

      <div className="mt-12">
        <AddProject />
      </div>
    </div>
  );
}

export default App;
