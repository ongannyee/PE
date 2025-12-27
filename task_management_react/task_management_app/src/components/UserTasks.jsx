import React, { useState, useEffect, useMemo } from 'react';
import { fetchUserTasks } from '../API/UserAPI';

const UserTasks = ({ currentUserId, projects, onNavigate }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isPrioritySort, setIsPrioritySort] = useState(false); 

  useEffect(() => {
    const loadTasks = async () => {
      if (!currentUserId) return;
      try {
        setLoading(true);
        const data = await fetchUserTasks(currentUserId);
        setTasks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, [currentUserId]);

  // --- UPDATED: Robust Sorting Logic ---
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      
      // 1. HELPER: Map Priority Strings to Numbers
      const getPrioValue = (p) => {
        const s = String(p || "").toLowerCase();
        if (s === 'urgent' || s === '3') return 3;
        if (s === 'high' || s === '2') return 2;
        if (s === 'medium' || s === '1') return 1;
        return 0; // Low or default
      };

      const prioA = getPrioValue(a.priority);
      const prioB = getPrioValue(b.priority);

      // 2. HELPER: Parse Dates
      const dateA = a.dueDate || a.DueDate ? new Date(a.dueDate || a.DueDate) : null;
      const dateB = b.dueDate || b.DueDate ? new Date(b.dueDate || b.DueDate) : null;

      const compareDates = () => {
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;  // No date = Bottom
        if (!dateB) return -1; // No date = Bottom
        return dateA - dateB;  // Ascending (Earliest -> Latest)
      };

      const comparePriorities = () => {
        // Descending: 3 (Urgent) -> 0 (Low)
        return prioB - prioA; 
      };

      // 3. EXECUTE SORT
      if (isPrioritySort) {
        // Priority First
        const priorityDiff = comparePriorities();
        if (priorityDiff !== 0) return priorityDiff;
        return compareDates();
      } else {
        // Date First
        const dateDiff = compareDates();
        if (dateDiff !== 0) return dateDiff;
        return comparePriorities();
      }
    });
  }, [tasks, isPrioritySort]);

  const getProjectName = (projectId) => {
    if (!projects || projects.length === 0) return `Project #${projectId}`;
    const proj = projects.find(p => p.id === projectId || p.projectId === projectId);
    return proj ? proj.projectName : "Unknown Project";
  };

  const getStatusColor = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === 'completed' || s === 'done' || s === '2') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'inprogress' || s === 'in progress' || s === '1') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-600 border-gray-200'; 
  };

  const getPriorityColor = (priority) => {
    const p = String(priority).toLowerCase();
    if (p === '3' || p === 'urgent') return 'text-purple-700 bg-purple-100 border-purple-200';
    if (p === '2' || p === 'high') return 'text-red-700 bg-red-100 border-red-200';
    if (p === '1' || p === 'medium') return 'text-orange-700 bg-orange-100 border-orange-200';
    return 'text-blue-700 bg-blue-100 border-blue-200'; 
  };

  const getDueDateStyles = (dateObj) => {
    if (!dateObj) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateObj);

    if (due < today) return 'text-red-700 bg-red-100 border-red-200'; 
    if (due.toDateString() === today.toDateString()) return 'text-orange-700 bg-orange-100 border-orange-200'; 
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-end justify-between">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-500 mt-1">All tasks assigned to you.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
                <button 
                    onClick={() => setIsPrioritySort(false)}
                    className={`px-3 py-1.5 rounded-md transition-all ${!isPrioritySort ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    By Date
                </button>
                <button 
                    onClick={() => setIsPrioritySort(true)}
                    className={`px-3 py-1.5 rounded-md transition-all ${isPrioritySort ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    By Priority
                </button>
            </div>
            <div className="text-sm text-gray-400 border-l pl-4">
                Total: {tasks.length}
            </div>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-200">
          <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500">You have no pending tasks.</p>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {sortedTasks.map((task) => {
            const validDueDate = task.dueDate || task.DueDate || null;
            return (
              <div 
                key={task.taskId || task.id} 
                className="group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {task.title}
                      </h3>
                  </div>
                  
                  <div className="flex flex-wrap items-center text-sm text-gray-500 gap-3 mt-2">
                      <span className="flex items-center gap-1 font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          {getProjectName(task.projectId)}
                      </span>

                      {validDueDate ? (
                          <span className={`flex items-center gap-1 font-medium px-2 py-0.5 rounded border ${getDueDateStyles(validDueDate)}`}>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Due: {new Date(validDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">No Due Date</span>
                      )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${getPriorityColor(task.priority)}`}>
                           {['Low', 'Medium', 'High', 'Urgent'][task.priority] || task.priority || "Low"}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${getStatusColor(task.status)}`}>
                          {['Todo', 'In Progress', 'Done'][task.status] || task.status || "Todo"}
                      </span>
                  </div>

                  <button 
                      onClick={() => onNavigate(task.projectId)}
                      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors"
                  >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserTasks;