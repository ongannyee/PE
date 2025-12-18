import { FaTrash } from "react-icons/fa"; // Using react-icons for trash icon

function ProjectTableItem({ project, onDelete, onClick }) {
  return (
    <tr
      className="border-b hover:bg-gray-100 cursor-pointer"
      onClick={() => onClick && onClick(project)}
    >
      <td className="py-2 px-4">{project.projectId}</td>
      <td className="py-2 px-4">{project.projectName}</td>
      <td className="py-2 px-4">{project.startDate?.split("T")[0]}</td>
      <td className="py-2 px-4">{project.endDate?.split("T")[0] || "-"}</td>
      <td className="py-2 px-4">{project.isArchived ? "Yes" : "No"}</td>
      <td className="py-2 px-4 text-center">
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent row click
            onDelete && onDelete(project.projectId);
          }}
          className="text-red-600 hover:text-red-800 transition"
          title="Delete Project"
        >
          <FaTrash />
        </button>
      </td>
    </tr>
  );
}

export default ProjectTableItem;
