import ProjectTableItem from "./ProjectTableItem";

function ProjectTable({ projects = [], onDelete, onClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead>
  <tr className="bg-blue-600 text-white text-left">
    <th className="py-3 px-4 w-16">ID</th>
    <th className="py-3 px-4 w-1/4">Name</th>
    <th className="py-3 px-4 w-32">Start Date</th>
    <th className="py-3 px-4 w-32">End Date</th>
    <th className="py-3 px-4 w-32">Archived Name</th>
    <th className="py-3 px-4 w-16 text-center">Delete</th> {/* New column */}
  </tr>
</thead>


        <tbody>
          {projects.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                No projects found
              </td>
            </tr>
          ) : (
            projects.map((project) => (
              <ProjectTableItem
                key={project.projectId}
                project={project}
                onDelete={onDelete}
                onClick={onClick} // <-- pass it here
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProjectTable;
