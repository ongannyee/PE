import { useRef } from "react";
import { motion, useInView } from "motion/react";

const AnimatedTableRow = ({ children, delay = 0, index, onMouseEnter, onClick, isSelected }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5, triggerOnce: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      className={`rounded-lg border-2 overflow-hidden transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
      }`}
    >
      <table className="w-full" style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "80px" }} />
          <col style={{ width: "25%" }} />
          <col style={{ width: "140px" }} />
          <col style={{ width: "140px" }} />
          <col style={{ width: "140px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
        </colgroup>
        <tbody>
          <tr className="text-sm">
            {children}
          </tr>
        </tbody>
      </table>
    </motion.div>
  );
};

function AnimatedProjectTableItem({ 
  project, 
  onDelete, 
  onClick, 
  onEdit, 
  onArchiveOrRestore, 
  index, 
  selectedIndex, 
  onItemMouseEnter,
  currentUserId,
  userRole 
}) {
  const isArchived = Boolean(project.isArchived);
  const isSelected = selectedIndex === index;

  // FIXED: Lowercase normalization for GUID comparison
  const isOwner = currentUserId && project.createdByUserId && 
                  currentUserId.toLowerCase() === project.createdByUserId.toLowerCase();
  
  const canManage = userRole === "Admin" || isOwner;
  
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
    <AnimatedTableRow
      delay={index * 0.1}
      index={index}
      isSelected={isSelected}
      onMouseEnter={() => onItemMouseEnter && onItemMouseEnter(index)}
      onClick={() => onClick(project)}
    >
      <td className="py-3 px-4 overflow-hidden text-ellipsis whitespace-nowrap" style={{ width: "80px" }}>
        {project.projectId}
      </td>
      
      <td className="py-3 px-4 font-medium" style={{ width: "25%" }}>
        <div className="flex justify-between items-center group">
          <span className="text-blue-600 truncate mr-2" title={project.projectName}>
            {project.projectName}
          </span>
          
          {canManage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
              className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded hover:bg-blue-50 text-xs border border-transparent hover:border-blue-200"
            >
              Edit
            </button>
          )}
        </div>
      </td>

      <td className="py-3 px-4 overflow-hidden text-ellipsis whitespace-nowrap text-gray-700" style={{ width: "140px" }}>
        {formatDate(project.startDate)}
      </td>
      <td className="py-3 px-4 overflow-hidden text-ellipsis whitespace-nowrap text-gray-700" style={{ width: "140px" }}>
        {formatDate(project.endDate)}
      </td>

      <td className="py-3 px-4 text-center" style={{ width: "140px" }}>
        <div className={`inline-flex px-3 py-1 rounded-full text-white text-xs font-medium ${status.color}`}>
          {status.text}
        </div>
      </td>

      <td className="py-3 px-4 text-center" style={{ width: "100px" }}>
        {canManage ? (
          <button
            className={`px-3 py-1.5 rounded-md text-white text-sm font-medium transition-colors ${
              isArchived ? "bg-green-600 hover:bg-green-700" : "bg-yellow-500 hover:bg-yellow-600"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onArchiveOrRestore(project.projectId);
            }}
          >
            {isArchived ? "Restore" : "Archive"}
          </button>
        ) : (
          <span className="text-gray-300 text-xs italic">View Only</span>
        )}
      </td>

      <td className="py-3 px-4 text-center" style={{ width: "100px" }}>
        {canManage && (
          <button
            className="px-3 py-1.5 rounded-md text-white text-sm font-medium bg-red-500 hover:bg-red-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.projectId);
            }}
          >
            Delete
          </button>
        )}
      </td>
    </AnimatedTableRow>
  );
}

export default AnimatedProjectTableItem;