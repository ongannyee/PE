// ProjectTable.jsx
import ProjectTableItem from "./ProjectTableItem";

function ProjectTable({ projects = [], onDelete, onClick, onArchiveOrRestore }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-lg shadow-md" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '80px' }} /> {/* ID */}
          <col style={{ width: '25%' }} /> {/* Name */}
          <col style={{ width: '140px' }} /> {/* Start Date */}
          <col style={{ width: '140px' }} /> {/* End Date */}
          <col style={{ width: '140px' }} /> {/* Status */}
          <col style={{ width: '100px' }} /> {/* Archive/Restore */}
          <col style={{ width: '100px' }} /> {/* Delete */}
        </colgroup>
        <thead>
          <tr className="bg-blue-600 text-white text-left text-sm">
            <th className="py-3 px-2">ID</th>
            <th className="py-3 px-2">Name</th>
            <th className="py-3 px-2">Start Date</th>
            <th className="py-3 px-2">End Date</th>
            <th className="py-3 px-2 text-center">Status</th>
            <th className="py-3 px-2 text-center"></th>
            <th className="py-3 px-2 text-center"></th>
          </tr>
        </thead>

        <tbody>
          {projects.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-4 text-gray-500">
                No projects found
              </td>
            </tr>
          ) : (
            projects.map((project) => (
              <ProjectTableItem
                key={project.projectId}
                project={project}
                onDelete={onDelete}
                onArchiveOrRestore={onArchiveOrRestore}
                onClick={onClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProjectTable;
