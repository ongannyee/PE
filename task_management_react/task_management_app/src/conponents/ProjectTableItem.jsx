function ProjectTableItem({ project, idx, onDelete }) {
  return (
    <tr className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
      <td className="py-2 px-4 text-center">{project.projectId}</td>
      <td className="py-2 px-4">{project.title}</td>
      <td className="py-2 px-4">{project.author}</td>
      <td className="py-2 px-4">{project.genre}</td>
      <td className="py-2 px-4 text-right">{project.price.toFixed(2)}</td>
      <td className="py-2 px-4 text-center">
        {project.publishedDate.split("T")[0]}
      </td>
      <td className="py-2 px-4 text-center flex gap-2 justify-center">
        <button
          onClick={() => onDelete(project.projectId)}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 transition"
          style={{ width: 80 }}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

export default ProjectTableItem;
