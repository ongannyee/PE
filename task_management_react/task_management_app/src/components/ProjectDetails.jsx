import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AddTaskForm from './AddTaskForm';
import UpdateTaskModal from './UpdateTaskModal';
import SubtaskList from './SubtaskList'; 
import CommentSection from './CommentSection';
import ProjectPieChart from './ProjectPieChart';
import ProjectBarChart from './ProjectBarChart';
import ProjectLineChart from './ProjectLineChart';
import DataTable from './DataTable';

// API Imports
import { fetchProjectTasks, fetchProjectMembers } from '../API/ProjectAPI';
import { fetchSubTasksByTask } from '../API/TaskItemAPI'; 

const ProjectDetails = ({ project, onBack, currentUserId }) => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSortedByPriority, setIsSortedByPriority] = useState(false);

  const priorityWeight = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };

  const loadInitialData = useCallback(async () => {
    if (!project || !project.id) return;
    try {
      const [taskData, memberData] = await Promise.all([
        fetchProjectTasks(project.id),
        fetchProjectMembers(project.id)
      ]);

      const tasksWithProgress = await Promise.all(taskData.map(async (t) => {
        const subs = await fetchSubTasksByTask(t.id);
        const completed = subs.filter(s => s.isCompleted).length;
        const total = subs.length;
        
        let autoStatus = 'To Do';
        if (total > 0) {
            if (completed === total) autoStatus = 'Completed';
            else if (completed > 0) autoStatus = 'In Progress';
        } else {
            // Mapping numeric status from C# Enum if applicable
            if (t.status === 2 || t.status === 'Completed') autoStatus = 'Completed';
            else if (t.status === 1 || t.status === 'In Progress') autoStatus = 'In Progress';
        }

        return { 
            ...t, 
            totalSubs: total, 
            completedSubs: completed,
            calculatedStatus: autoStatus
        };
      }));

      setTasks(tasksWithProgress);
      setMembers(memberData || []);
    } catch (err) {
      console.error("Error loading project details:", err);
    }
  }, [project]);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  const analytics = useMemo(() => {
    // 1. PIE DATA
    const pie = [
      { name: 'Completed', value: tasks.filter(t => t.calculatedStatus === 'Completed').length },
      { name: 'In Progress', value: tasks.filter(t => t.calculatedStatus === 'In Progress').length },
      { name: 'To Do', value: tasks.filter(t => t.calculatedStatus === 'To Do').length },
    ];

    // 2. BAR DATA - Enhanced matching logic
    const bar = members.map(m => {
      // Get the member ID from various possible keys
      const mId = m.id || m.userId || m.guid;
      
      const memberTasks = tasks.filter(t => {
        // Look inside the assignedTo array of the task
        if (!t.assignedTo || !Array.isArray(t.assignedTo)) return false;
        
        return t.assignedTo.some(assignee => {
            const aId = assignee.id || assignee.userId || assignee.guid || assignee;
            // Use loose equality (==) in case one is a string and other is a GUID object
            return aId == mId;
        });
      });

      return {
        name: m.username || m.name || 'Unknown',
        todo: memberTasks.filter(t => t.calculatedStatus === 'To Do').length,
        inprogress: memberTasks.filter(t => t.calculatedStatus === 'In Progress').length,
        completed: memberTasks.filter(t => t.calculatedStatus === 'Completed').length,
      };
    });

    // 3. LINE DATA
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const line = sortedTasks.map((t, idx) => {
      const completedSoFar = tasks.filter(task => task.calculatedStatus === 'Completed' && new Date(task.dueDate) <= new Date(t.dueDate)).length;
      return {
        date: new Date(t.dueDate).toLocaleDateString(),
        actual: Math.round((completedSoFar / (tasks.length || 1)) * 100),
        expected: Math.round(((idx + 1) / (tasks.length || 1)) * 100)
      };
    });

    return { pie, bar, line };
  }, [tasks, members]);

  const getStatusInfo = (task) => {
    const statusLabel = task.calculatedStatus || 'To Do';
    switch (statusLabel) {
        case 'Completed': return { label: 'Completed', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
        case 'In Progress': return { label: 'In Progress', color: 'bg-amber-50 text-amber-600 border-amber-100' };
        default: return { label: 'To Do', color: 'bg-slate-100 text-slate-500 border-slate-200' };
    }
  };

  const toggleTaskExpand = (id) => setExpandedTaskId(expandedTaskId === id ? null : id);
  
  const displayedTasks = isSortedByPriority 
    ? [...tasks].sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0))
    : tasks;

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen text-left">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="text-slate-500 hover:text-blue-600 font-medium">← Back</button>
        <div className="flex gap-3">
          <button onClick={() => setIsSortedByPriority(!isSortedByPriority)} className="bg-white border px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
            {isSortedByPriority ? '🔼 Priority Sorted' : 'Sort Priority'}
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold shadow-sm">+ New Task</button>
        </div>
      </div>

      <div className="bg-white p-10 rounded-3xl border border-slate-200 mb-10 shadow-sm">
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">{project.projectName}</h1>
        <div className="flex gap-8 mt-10 border-b border-slate-100">
            <button onClick={() => setActiveTab('tasks')} className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'tasks' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Tasks ({tasks.length})</button>
            <button onClick={() => setActiveTab('stats')} className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Analytics</button>
        </div>
      </div>

      {activeTab === 'tasks' ? (
        <div className="space-y-4 pb-20">
          {displayedTasks.map(t => {
            const status = getStatusInfo(t);
            return (
              <div key={t.id} className="bg-white rounded-2xl border p-6 hover:border-blue-400 shadow-sm transition-all overflow-hidden">
                <div onClick={() => toggleTaskExpand(t.id)} className="flex justify-between items-center cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className={`w-3 h-3 rounded-full ${status.label === 'Completed' ? 'bg-emerald-500' : (status.label === 'In Progress' ? 'bg-amber-400' : 'bg-slate-300')}`}></div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">{t.title}</h4>
                      <div className="flex gap-4 mt-2">
                        <span className={`text-[10px] font-black px-2 py-1 rounded border uppercase tracking-wider ${status.color}`}>{status.label}</span>
                        <span className="text-slate-400 text-xs font-bold">📅 {new Date(t.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedTaskForEdit(t); setIsEditModalOpen(true); }} className="hover:text-blue-500 p-2">✏️</button>
                    <div className={`transition-transform ${expandedTaskId === t.id ? 'rotate-180' : ''}`}>▼</div>
                  </div>
                </div>
                {expandedTaskId === t.id && (
                  <div className="mt-6 pt-6 border-t flex flex-col md:flex-row gap-10">
                    <div className="flex-1"><SubtaskList taskGuid={t.id} onSubtaskStatusChange={loadInitialData} /></div>
                    <div className="flex-1"><CommentSection taskGuid={t.id} taskName={t.title} currentUserId={currentUserId} projectId={project.id} /></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-10 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProjectPieChart data={analytics.pie} />
                <ProjectBarChart data={analytics.bar} />
            </div>
            <ProjectLineChart data={analytics.line} />
            <div className="space-y-6">
                <DataTable title="Status Summary" headers={['Status', 'Count']} rows={analytics.pie} />
                <DataTable title="Member Load" headers={['Member', 'To Do', 'In Progress', 'Done']} rows={analytics.bar.map(b => ({ name: b.name, todo: b.todo, inprogress: b.inprogress, done: b.completed }))} />
            </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8">
            <h2 className="text-3xl font-black text-slate-900 mb-6">New Task</h2>
            <AddTaskForm userId={currentUserId} defaultProjectId={project.id} availableMembers={members} onTaskAdded={() => { loadInitialData(); setIsAddModalOpen(false); }} />
            <button onClick={() => setIsAddModalOpen(false)} className="mt-4 w-full text-slate-400 font-black uppercase text-xs">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;