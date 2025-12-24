// ProjectTableItem.jsx
function ProjectTableItem({ project, onDelete, onClick, onArchiveOrRestore }) {
  const isArchived = Boolean(project.isArchived);
  const getStatus = () => {
    const now = new Date();
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);

    if (isArchived) return { text: "Archived", color: "bg-gray-400" };
    if (now < start) return { text: "Upcoming", color: "bg-blue-400" };
    if (now > end) return { text: "Finished", color: "bg-green-500" };
    if (now >= start && now <= end)
      return { text: "In Progress", color: "bg-yellow-400" };
    return { text: "Unknown", color: "bg-gray-300" };
  };

  const status = getStatus();
  const formatDate = (dateString) => dateString?.split("T")[0] || "";

  return (
    <tr className="border-b hover:bg-gray-50 text-sm">
      <td className="py-2 px-2 overflow-hidden text-ellipsis whitespace-nowrap">{project.projectId}</td>
      <td
        className="py-2 px-2 cursor-pointer text-blue-600 overflow-hidden text-ellipsis whitespace-nowrap"
        onClick={() => onClick(project)}
        title={project.projectName}
      >
        {project.projectName}
      </td>
      <td className="py-2 px-2 overflow-hidden text-ellipsis whitespace-nowrap">{formatDate(project.startDate)}</td>
      <td className="py-2 px-2 overflow-hidden text-ellipsis whitespace-nowrap">{formatDate(project.endDate)}</td>

      {/* Status */}
      <td className="py-2 px-2 text-center">
        <div
          className={`w-full flex justify-center px-2 py-1 rounded text-white font-medium ${status.color}`}
        >
          {status.text}
        </div>
      </td>

      {/* Archive / Restore */}
      <td className="py-2 px-2 text-center">
        <button
          className={`w-full px-2 py-1 rounded text-white transition-colors ${
            isArchived
              ? "bg-green-600 hover:bg-green-700"
              : "bg-yellow-500 hover:bg-yellow-600"
          }`}
          onClick={() => onArchiveOrRestore(project.projectId)}
        >
          {isArchived ? "Restore" : "Archive"}
        </button>
      </td>

      {/* Delete */}
      <td className="py-2 px-2 text-center">
        <button
          className="w-full px-2 py-1 rounded text-white bg-red-500 hover:bg-red-600 transition-colors"
          onClick={() => onDelete(project.projectId)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

export default ProjectTableItem;
