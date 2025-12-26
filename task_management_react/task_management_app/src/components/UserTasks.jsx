import React, { useState, useEffect } from 'react';
// 1. IMPORT API
import { fetchUserTasks } from '../API/UserAPI';

const UserTasks = ({ currentUserId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      if (!currentUserId) return;

      try {
        setLoading(true);
        // 2. USE API FUNCTION
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

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === 'completed' || s === 'done') return 'bg-green-100 text-green-800 border-green-200';
    if (s === 'inprogress' || s === 'in progress') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200'; 
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Work</h1>
        <p className="text-gray-500 mt-1">Here is everything assigned to you across all projects.</p>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-200">
          <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500">You have no active tasks assigned to you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div 
              key={task.taskId} 
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden flex flex-col"
            >
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Project #{task.projectId}
                </span>
                {task.dueDate && (
                  <span className="text-xs text-red-500 font-medium">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800 leading-tight">
                    {task.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {task.description || "No description provided."}
                </p>
              </div>

              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
                <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  Priority: {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserTasks;