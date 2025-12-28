import { useRef } from "react";
import { motion, useInView } from "motion/react";

/**
 * Helper component that provides the entry animation and wrapper logic
 * for each row in the project table.
 */
const AnimatedTableRow = ({ children, delay = 0, index, onMouseEnter, onClick, isSelected }) => {
  const ref = useRef(null);
  // Animates when the row enters the viewport
  const inView = useInView(ref, { amount: 0.1, triggerOnce: false });

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.9, opacity: 0, y: 10 }}
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.9, opacity: 0, y: 10 }}
      transition={{ duration: 0.2, delay: Math.min(delay, 0.5) }} // Cap delay for long lists
      className={`rounded-lg border-2 overflow-hidden transition-all duration-200 cursor-pointer mb-2 ${
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

/**
 * The main item component for the Project Table.
 * Handles status calculation, permissions, and action buttons.
 */
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

  // Permissions logic: Admin or the specific Project Creator can manage
  const isOwner = currentUserId && project.createdByUserId && 
                  currentUserId.toLowerCase() === project.createdByUserId.toLowerCase();
  
  const canManage = userRole === "Admin" || isOwner;
  
  // Calculate dynamic status based on dates and archival state
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
  const formatDate = (dateString) => dateString?.split("T")[0] || "N/A";

  return (
    <AnimatedTableRow
      delay={index * 0.05}
      index={index}
      isSelected={isSelected}
      onMouseEnter={() => onItemMouseEnter && onItemMouseEnter(index)}
      onClick={() => onClick && onClick(project)}
    >
      {/* ID Column */}
      <td className="py-4 px-4 overflow-hidden text-ellipsis whitespace-nowrap text-gray-500 font-mono text-xs" style={{ width: "80px" }}>
        #{project.projectId}
      </td>
      
      {/* Name & Edit Column */}
      <td className="py-4 px-4 font-medium" style={{ width: "25%" }}>
        <div className="flex justify-between items-center group">
          <span className="text-blue-700 truncate mr-2" title={project.projectName}>
            {project.projectName}
          </span>
          
          {canManage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
              className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded hover:bg-blue-100 text-xs border border-transparent hover:border-blue-200"
            >
              Edit
            </button>
          )}
        </div>
      </td>

      {/* Dates Columns */}
      <td className="py-4 px-4 overflow-hidden text-ellipsis whitespace-nowrap text-gray-700" style={{ width: "140px" }}>
        {formatDate(project.startDate)}
      </td>
      <td className="py-4 px-4 overflow-hidden text-ellipsis whitespace-nowrap text-gray-700" style={{ width: "140px" }}>
        {formatDate(project.endDate)}
      </td>

      {/* Status Column */}
      <td className="py-4 px-4 text-center" style={{ width: "140px" }}>
        <div className={`inline-flex px-3 py-1 rounded-full text-white text-[10px] uppercase tracking-wider font-bold ${status.color}`}>
          {status.text}
        </div>
      </td>

      {/* Archive/Restore Column */}
      <td className="py-4 px-4 text-center" style={{ width: "100px" }}>
        {canManage ? (
          <button
            className={`w-full px-2 py-1.5 rounded-md text-white text-xs font-semibold transition-colors shadow-sm ${
              isArchived ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-500 hover:bg-amber-600"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onArchiveOrRestore(project.projectId);
            }}
          >
            {isArchived ? "Restore" : "Archive"}
          </button>
        ) : (
          <span className="text-gray-400 text-[10px] font-medium uppercase">View Only</span>
        )}
      </td>

      {/* Delete Column */}
      <td className="py-4 px-4 text-center" style={{ width: "100px" }}>
        {canManage && (
          <button
            className="w-full px-2 py-1.5 rounded-md text-white text-xs font-semibold bg-rose-500 hover:bg-rose-600 transition-colors shadow-sm"
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