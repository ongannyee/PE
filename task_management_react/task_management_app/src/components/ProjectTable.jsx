import ProjectTableItem from "./ProjectTableItem";

function ProjectTable({ projects, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="py-3 px-4">ID</th>
            <th className="py-3 px-4">Title</th>
            <th className="py-3 px-4">Author</th>
            <th className="py-3 px-4">Genre</th>
            <th className="py-3 px-4">Price ($)</th>
            <th className="py-3 px-4">Published Date</th>
            <th className="py-3 px-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, idx) => (
            <ProjectTableItem
              key={project.projectId}
              project={project}
              idx={idx}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProjectTable;
