import React, { useState, useEffect } from 'react';
import AddTaskForm from './AddTaskForm';
import UpdateTaskModal from './UpdateTaskModal';
import SubtaskList from './SubtaskList'; 
import CommentSection from './CommentSection';
import { fetchProjectTasks } from '../API/ProjectAPI';
import { deleteTask } from '../API/TaskItemAPI';

const ProjectDetails = ({ project, onBack, currentUserId }) => {
  const [tasks, setTasks] = useState([]);
  const [expandedTaskId, setExpandedTaskId] = useState(null); // Now stores Guid ID
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSortedByPriority, setIsSortedByPriority] = useState(false);

  const priorityWeight = {
    'Urgent': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1
  };

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

  // FIX: Using Guid id for expansion toggle
  const toggleTaskExpand = (id) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const handleEditClick = (e, task) => {
    e.stopPropagation();
    setSelectedTaskForEdit(task);
    setIsEditModalOpen(true);
  };

  // FIX: Using Guid id for deletion
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(id);
        loadProjectTasks();
      } catch (err) {
        console.error("Error deleting task:", err);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-50 text-red-600 border-red-100';
      case 'High': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Medium': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const displayedTasks = isSortedByPriority 
    ? [...tasks].sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0))
    : tasks;

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      {/* Navigation Header */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack} 
          className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all font-medium"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> 
          Back to Projects
        </button>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span> New Task
        </button>
      </div>

      {/* Project Banner */}
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 mb-10">
        <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Active Project</span>
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">{project.projectName}</h1>
        <p className="text-slate-500 mt-4 text-xl leading-relaxed max-w-3xl">{project.projectGoal}</p>
      </div>

      {/* Task List Section */}
      <div className="space-y-4 pb-20">
        <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Tasks</h3>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsSortedByPriority(!isSortedByPriority)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                        isSortedByPriority 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                    }`}
                >
                    ⚡ Sort by Priority: {isSortedByPriority ? "ON" : "OFF"}
                </button>

                <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                    {tasks.length} Total
                </span>
            </div>
        </div>
        
        {displayedTasks.length > 0 ? (
          displayedTasks.map(t => (
            <div 
              key={t.id} 
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                expandedTaskId === t.id 
                ? 'ring-4 ring-blue-500/10 shadow-xl border-blue-200' 
                : 'hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 border-slate-200 shadow-sm'
              }`}
            >
              {/* Task Row */}
              <div 
                onClick={() => toggleTaskExpand(t.id)} 
                className="p-6 flex justify-between items-center cursor-pointer group select-none"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    t.status === 'Done' ? 'bg-emerald-500 scale-110' : 'bg-slate-300'
                  }`}></div>
                  
                  <div>
                    <h4 className={`text-xl font-bold transition-colors duration-300 ${
                      expandedTaskId === t.id ? 'text-blue-600' : 'text-slate-800 group-hover:text-blue-500'
                    }`}>
                      {t.title}
                    </h4>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg border uppercase tracking-wider transition-colors ${getPriorityStyles(t.priority)}`}>
                        {t.priority}
                      </span>

                      <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 transition-colors">
                        <span className="text-sm">📅</span>
                        <span className="text-xs font-bold">{formatDate(t.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setExpandedTaskId(t.id); }} 
                    className="p-3 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all active:scale-90"
                  >
                    <span className="text-2xl">📂</span>
                  </button>

                  <button 
                    onClick={(e) => handleEditClick(e, t)} 
                    className="p-3 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                  >
                    <span className="text-xl">✏️</span>
                  </button>

                  <button 
                    onClick={(e) => handleDelete(e, t.id)} 
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                  >
                    <span className="text-xl">🗑️</span>
                  </button>
                  
                  <div className={`ml-2 text-slate-300 transition-transform duration-300 ${expandedTaskId === t.id ? 'rotate-180 text-blue-500' : 'group-hover:translate-x-1'}`}>
                    <span className="text-lg">▼</span>
                  </div>
                </div>
              </div>

              {/* EXPANDED SECTION */}
              {expandedTaskId === t.id && (
                <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/50 to-white flex flex-col md:flex-row min-h-[600px] animate-in slide-in-from-top-4 duration-500">
                  <div className="flex-1 p-10 border-r border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg shadow-blue-200 shadow-lg font-black text-white text-xs">01</div>
                        <h5 className="font-black text-slate-800 uppercase tracking-widest text-xs">Task Checklist</h5>
                      </div>
                    </div>
                    <div className="h-full">
                      <SubtaskList taskGuid={t.id} taskId={t.taskId} />
                    </div>
                  </div>

                  <div className="flex-1 p-10 bg-white/40">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="bg-emerald-500 p-2 rounded-lg shadow-emerald-200 shadow-lg font-black text-white text-xs">02</div>
                      <h5 className="font-black text-slate-800 uppercase tracking-widest text-xs">Comments</h5>
                    </div>
                    <div className="h-full pb-10">
                      {/* FIXED: Passing t.title as taskName here */}
                      <CommentSection 
                        taskGuid={t.id} 
                        taskName={t.title} 
                        currentUserId={currentUserId} 
                        projectId={project.id}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200">
            <span className="text-6xl block mb-4 opacity-20">🎯</span>
            <p className="text-slate-400 font-bold text-lg">No tasks found.</p>
          </div>
        )}
      </div>

      {/* MODALS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 pb-0 flex justify-between items-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">New Task</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-300 hover:text-slate-900 text-4xl font-light">&times;</button>
            </div>
            <div className="p-8">
              <AddTaskForm 
                userId={currentUserId} 
                defaultProjectId={project.id} 
                onTaskAdded={() => { loadProjectTasks(); setIsAddModalOpen(false); }} 
              />
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedTaskForEdit && (
        <UpdateTaskModal 
          task={selectedTaskForEdit}
          onClose={() => setIsEditModalOpen(false)}
          onTaskUpdated={() => { loadProjectTasks(); setIsEditModalOpen(false); }}
        />
      )}
    </div>
  );
};

export default ProjectDetails;