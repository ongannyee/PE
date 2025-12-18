import { useState, useEffect } from "react";
import { fetchProjects, deleteProject } from "../API/ProjectAPI";
import ProjectSearchBar from "../components/ProjectSearchBar";
import ProjectTable from "../components/ProjectTable";

function ProjectPage() {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleSearch = () => {
    const sorted = [...projects].sort((a, b) => a.projectId - b.projectId);
    setFiltered(
      sorted.filter((project) =>
        project.title.toLowerCase().includes(search.toLowerCase())
      )
    );
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
    <div>
      <ProjectSearchBar
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
        onReset={handleReset}
      />
      <ProjectTable projects={filtered} onDelete={handleDeleteProject} />
    </div>
  );
}

export default ProjectPage;
