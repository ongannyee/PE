import { useState, useCallback, useRef, useEffect } from "react";
import AnimatedProjectTableItem from "./AnimatedProjectTableItem";

function ProjectTable({ 
  projects = [], 
  onDelete, 
  onClick, 
  onEdit, 
  onArchiveOrRestore, 
  currentUserId,
  userRole 
}) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const tableRef = useRef(null);

  const handleItemMouseEnter = useCallback((index) => {
    setSelectedIndex(index);
  }, []);

  const handleItemClick = useCallback(
    (project, index) => {
      setSelectedIndex(index);
      if (onClick) {
        onClick(project);
      }
    },
    [onClick]
  );

  // Keyboard navigation logic
  useEffect(() => {
    if (projects.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, projects.length - 1));
      } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        if (selectedIndex >= 0 && selectedIndex < projects.length) {
          e.preventDefault();
          if (onClick) {
            onClick(projects[selectedIndex]);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [projects, selectedIndex, onClick]);

  // Scroll to selected item when using keyboard
  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !tableRef.current) return;
    
    const container = tableRef.current.closest(".overflow-x-auto") || tableRef.current;
    const selectedRow = container.querySelector(`[data-index="${selectedIndex}"]`);
    
    if (selectedRow) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedRow.offsetTop;
      const itemBottom = itemTop + selectedRow.offsetHeight;
      
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: "smooth" });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: "smooth",
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  return (
    <div className="overflow-x-auto relative" ref={tableRef}>
      <div className="bg-white rounded-lg shadow-md p-4 min-w-[800px]">
        <table className="w-full mb-3" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "80px" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "140px" }} />
            <col style={{ width: "140px" }} />
            <col style={{ width: "140px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "100px" }} />
          </colgroup>
          <thead>
            <tr className="bg-blue-600 text-white text-left text-sm">
              <th className="py-3 px-4 rounded-tl-lg">ID</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Start Date</th>
              <th className="py-3 px-4">End Date</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center"></th>
              <th className="py-3 px-4 text-center rounded-tr-lg"></th>
            </tr>
          </thead>
        </table>
        
        <div className="space-y-2">
          {projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              No projects found
            </div>
          ) : (
            projects.map((project, index) => (
              <AnimatedProjectTableItem
                key={project.projectId || project.id}
                project={project}
                index={index}
                selectedIndex={selectedIndex}
                onItemMouseEnter={handleItemMouseEnter}
                onDelete={onDelete}
                onArchiveOrRestore={onArchiveOrRestore}
                onClick={(p) => handleItemClick(p, index)}
                onEdit={onEdit} 
                currentUserId={currentUserId}
                userRole={userRole}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectTable;