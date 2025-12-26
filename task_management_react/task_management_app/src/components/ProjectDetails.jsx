import React, { useState, useEffect } from 'react';
import AddTaskForm from './AddTaskForm';
import TaskDetailModal from './TaskDetailModal';
import UpdateTaskModal from './UpdateTaskModal';
import { fetchProjectTasks } from '../API/ProjectAPI';
import { deleteTask, updateTask } from '../API/TaskItemAPI';

const ProjectDetails = ({ project, onBack, currentUserId }) => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadProjectTasks = async () => {
    if (!project || !project.id) return;
    try {
      const data = await fetchProjectTasks(project.id);
      setTasks(data);
    } catch (err) {
      console.error("Error loading tasks:", err);
    }
  };

  useEffect(() => {
    loadProjectTasks();
  }, [project]);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleEditClick = (e, task) => {
    e.stopPropagation(); // Prevent opening the Detail Modal
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleStatusChange = async (e, task) => {
    e.stopPropagation();
    const newStatus = parseInt(e.target.value);
    try {
      await updateTask(task.taskId, { ...task, status: newStatus });
      loadProjectTasks();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async (e, taskId) => {
    e.stopPropagation();
    if (window.confirm("Delete task?")) {
      try {
        await deleteTask(taskId);
        loadProjectTasks();
      } catch (err) {
        console.error("Error deleting task:", err);
      }
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-blue-600 font-medium hover:underline">
          &larr; Back to Projects
        </button>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow transition-all"
        >
          + New Task
        </button>
      </div>

      {/* Project Banner */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{project.projectName}</h1>
        <p className="text-gray-600 mt-2">{project.projectGoal}</p>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 font-sans">Project Tasks</h3>
        {tasks.length > 0 ? (
          tasks.map(t => (
            <div 
              key={t.taskId} 
              onClick={() => handleTaskClick(t)} 
              className="bg-white p-4 rounded-lg border flex justify-between items-center cursor-pointer hover:shadow-md transition-all border-gray-200 hover:border-blue-400"
            >
              <div>
                <h4 className="font-bold text-gray-800">{t.title}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  t.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {t.status}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <select 
                  value={t.status === 'Todo' ? 0 : t.status === 'InProgress' ? 1 : 2} 
                  onClick={(e) => e.stopPropagation()} 
                  onChange={(e) => handleStatusChange(e, t)} 
                  className="text-xs border rounded p-1.5 bg-gray-50"
                >
                  <option value={0}>Todo</option>
                  <option value={1}>In Progress</option>
                  <option value={2}>Done</option>
                </select>

                {/* EDIT BUTTON */}
                <button 
                  onClick={(e) => handleEditClick(e, t)} 
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                  title="Edit Task"
                >
                  ✏️
                </button>

                {/* DELETE BUTTON */}
                <button 
                  onClick={(e) => handleDelete(e, t.taskId)} 
                  className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400 italic">No tasks assigned to this project yet.</div>
        )}
      </div>

      {/* MODAL: Add Task */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Create New Task</h2>
            <AddTaskForm 
              userId={currentUserId} 
              defaultProjectId={project.id} 
              onTaskAdded={() => { loadProjectTasks(); setIsAddModalOpen(false); }} 
            />
            <button onClick={() => setIsAddModalOpen(false)} className="mt-4 text-gray-500 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* MODAL: Edit Task */}
      {isEditModalOpen && selectedTask && (
        <UpdateTaskModal 
          task={selectedTask}
          onClose={() => setIsEditModalOpen(false)}
          onTaskUpdated={() => { loadProjectTasks(); setIsEditModalOpen(false); }}
        />
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal 
        task={selectedTask} 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        currentUserId={currentUserId} 
      />
    </div>
  );
};

export default ProjectDetails;