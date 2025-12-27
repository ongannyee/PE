import React, { useState, useEffect, useCallback } from 'react';
import AddTaskForm from './AddTaskForm';
import UpdateTaskModal from './UpdateTaskModal';
import SubtaskList from './SubtaskList'; 
import CommentSection from './CommentSection';
import { fetchProjectTasks, fetchProjectMembers } from '../API/ProjectAPI';
import { deleteTask, fetchSubTasksByTask, fetchTaskAttachments } from '../API/TaskItemAPI'; 
import { fetchSubTaskAttachments } from '../API/SubtaskAPI';
import { uploadToTask, deleteAttachment } from '../API/AttachmentAPI'; 

const ProjectDetails = ({ project, onBack, currentUserId }) => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSortedByPriority, setIsSortedByPriority] = useState(false);
  
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [fileTargetTask, setFileTargetTask] = useState(null);
  const [taskFiles, setTaskFiles] = useState([]); 
  const [subtaskFilesMap, setSubtaskFilesMap] = useState([]); 
  const [uploadFile, setUploadFile] = useState(null);
  const [isFilesLoading, setIsFilesLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
        const total = subs.length;
        const completed = subs.filter(s => s.isCompleted).length;
        
        let autoStatus = t.status; 
        if (total > 0) {
            if (completed === total) autoStatus = 'Completed';
            else if (completed > 0) autoStatus = 'In Progress';
            else autoStatus = 'To Do';
        } else {
            if (t.status === 1 || t.status === 'InProgress') autoStatus = 'In Progress';
            else if (t.status === 2 || t.status === 'Done' || t.status === 'Completed') autoStatus = 'Completed';
            else autoStatus = 'To Do';
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

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const getStatusInfo = (task) => {
    const statusLabel = task.calculatedStatus || 'To Do';
    switch (statusLabel) {
        case 'Completed':
            return { label: 'Completed', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
        case 'In Progress':
            return { label: 'In Progress', color: 'bg-amber-50 text-amber-600 border-amber-100' };
        default:
            return { label: 'To Do', color: 'bg-slate-100 text-slate-500 border-slate-200' };
    }
  };

  const handleFolderClick = async (e, task) => {
    e.stopPropagation();
    if (!task || !task.id) return;

    setFileTargetTask(task);
    setIsFileModalOpen(true);
    setIsFilesLoading(true);
    setTaskFiles([]); 
    
    try {
      const taskAttachments = await fetchTaskAttachments(task.id);
      setTaskFiles(taskAttachments || []);

      const subs = await fetchSubTasksByTask(task.id);
      const subFiles = await Promise.all(subs.map(async (st) => {
        const attachments = await fetchSubTaskAttachments(st.id);
        return { title: st.title, files: attachments || [] };
      }));
      
      setSubtaskFilesMap(subFiles.filter(item => item.files.length > 0));
    } catch (err) {
      console.error("Error loading task resources:", err);
    } finally {
      setIsFilesLoading(false);
    }
  };

  const handleUploadToTask = async () => {
    if (!uploadFile || !fileTargetTask) return;
    setIsUploading(true);
    try {
      await uploadToTask(uploadFile, fileTargetTask.id);
      setUploadFile(null);
      const updated = await fetchTaskAttachments(fileTargetTask.id);
      setTaskFiles(updated || []);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Delete this file permanently?")) return;
    try {
      await deleteAttachment(fileId);
      setTaskFiles(prev => prev.filter(f => (f.id || f.attachmentId || f.attachmentGuid) !== fileId));
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const toggleTaskExpand = (id) => setExpandedTaskId(expandedTaskId === id ? null : id);
  const handleEditClick = (e, task) => { e.stopPropagation(); setSelectedTaskForEdit(task); setIsEditModalOpen(true); };
  const handleDeleteTask = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this task?")) { await deleteTask(id); loadInitialData(); }
  };

  const getPriorityStyles = (p) => {
    switch (p) {
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
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen text-left">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Projects
        </button>
        
        <div className="flex gap-3">
          {/* ADDED SORT BUTTON HERE */}
          <button 
            onClick={() => setIsSortedByPriority(!isSortedByPriority)} 
            className={`px-4 py-2.5 rounded-xl font-bold transition-all border flex items-center gap-2 ${
              isSortedByPriority 
              ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-inner' 
              : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
            }`}
          >
            <span>{isSortedByPriority ? '🔼 Priority Sorted' : 'Sort by Priority'}</span>
          </button>

          <button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all">+ New Task</button>
        </div>
      </div>

      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 mb-10 flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Active Project</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">{project.projectName}</h1>
          <p className="text-slate-500 mt-4 text-xl leading-relaxed max-w-2xl">{project.projectGoal}</p>
        </div>
        <div className="hidden md:block w-64 text-right">
          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Team Members</h5>
          <div className="flex flex-wrap justify-end gap-2">
            {members.map((m, idx) => (
              <div key={idx} className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm" title={m.username}>
                {(m.username || '?').charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 pb-20">
        {displayedTasks.map(t => {
          const status = getStatusInfo(t);
          const progressPercent = (t.completedSubs / (t.totalSubs || 1)) * 100;

          return (
            <div key={t.id} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${expandedTaskId === t.id ? 'ring-4 ring-blue-500/10 shadow-xl border-blue-200' : 'hover:border-blue-400 border-slate-200 shadow-sm'}`}>
              <div onClick={() => toggleTaskExpand(t.id)} className="p-6 flex justify-between items-center cursor-pointer group select-none">
                <div className="flex items-center gap-6">
                  <div className={`w-3 h-3 rounded-full ${status.label === 'Completed' ? 'bg-emerald-500' : (status.label === 'In Progress' ? 'bg-amber-400' : 'bg-slate-300')}`}></div>
                  <div>
                    <h4 className={`text-xl font-bold ${expandedTaskId === t.id ? 'text-blue-600' : 'text-slate-800'}`}>{t.title}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg border uppercase tracking-wider ${getPriorityStyles(t.priority)}`}>{t.priority}</span>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg border uppercase tracking-wider ${status.color}`}>{status.label}</span>
                      <span className="text-slate-400 text-xs font-bold">📅 {new Date(t.dueDate).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-500 ${status.label === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase">{t.completedSubs}/{t.totalSubs} Steps</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => handleFolderClick(e, t)} className="p-3 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all">📂</button>
                  <button onClick={(e) => handleEditClick(e, t)} className="p-3 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">✏️</button>
                  <button onClick={(e) => handleDeleteTask(e, t.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">🗑️</button>
                  <div className={`ml-2 text-slate-300 transition-transform ${expandedTaskId === t.id ? 'rotate-180' : ''}`}>▼</div>
                </div>
              </div>
              {expandedTaskId === t.id && (
                <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/50 to-white flex flex-col md:flex-row min-h-[500px]">
                  <div className="flex-1 p-10 border-r border-slate-100">
                    <SubtaskList taskGuid={t.id} onSubtaskStatusChange={loadInitialData} />
                  </div>
                  <div className="flex-1 p-10 bg-white/40">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-6">Discussion Board</span>
                    <CommentSection taskGuid={t.id} taskName={t.title} currentUserId={currentUserId} projectId={project.id} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isFileModalOpen && fileTargetTask && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Resource Explorer</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Task: {fileTargetTask.title}</p>
              </div>
              <button onClick={() => setIsFileModalOpen(false)} className="text-slate-300 hover:text-slate-900 text-3xl">&times;</button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-3 text-center">Upload to Task Root</label>
                <div className="flex gap-3">
                  <input type="file" id="task-direct-upload" className="hidden" onChange={(e) => setUploadFile(e.target.files[0])} />
                  <label htmlFor="task-direct-upload" className="flex-1 bg-white border-2 border-dashed border-blue-200 rounded-2xl p-4 text-sm font-bold text-slate-500 text-center cursor-pointer hover:border-blue-400 transition-all truncate">
                    {uploadFile ? `📄 ${uploadFile.name}` : "Drop file here or click to browse"}
                  </label>
                  <button onClick={handleUploadToTask} disabled={!uploadFile || isUploading} className="bg-slate-900 text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                    {isUploading ? "..." : "Upload"}
                  </button>
                </div>
              </div>

              <div>
                <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">Direct Task Files</h5>
                <div className="space-y-2">
                  {isFilesLoading ? (
                    <p className="text-slate-400 text-[10px] animate-pulse">Checking for files...</p>
                  ) : taskFiles.length > 0 ? taskFiles.map(file => (
                    <div key={file.id || file.attachmentId} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-2xl opacity-50">📄</span>
                        <p className="text-xs font-bold text-slate-800 truncate">{file.fileName}</p>
                      </div>
                      <div className="flex gap-3 ml-4 whitespace-nowrap">
                        <a href={`http://localhost:5017${file.fileUrl}`} target="_blank" rel="noreferrer" className="text-[9px] font-black text-blue-600 uppercase hover:underline">Download</a>
                        <button onClick={() => handleDeleteFile(file.id || file.attachmentId)} className="text-[9px] font-black text-red-400 uppercase">Delete</button>
                      </div>
                    </div>
                  )) : <p className="text-slate-400 text-[10px] italic">No root files found.</p>}
                </div>
              </div>

              <div>
                <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">Subtask Attachments</h5>
                <div className="space-y-4">
                  {subtaskFilesMap.length > 0 ? subtaskFilesMap.map((sub, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-3 px-2">Subtask: {sub.title}</p>
                        <div className="space-y-2">
                            {sub.files.map(file => (
                                <div key={file.id || file.attachmentId} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="text-lg">📎</span>
                                        <p className="text-xs font-medium text-slate-700 truncate">{file.fileName}</p>
                                    </div>
                                    <a href={`http://localhost:5017${file.fileUrl}`} target="_blank" rel="noreferrer" className="text-[9px] font-black text-blue-600 uppercase">Download</a>
                                </div>
                            ))}
                        </div>
                    </div>
                  )) : <p className="text-slate-400 text-[10px] italic">No subtask files found.</p>}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t flex justify-end">
                <button onClick={() => setIsFileModalOpen(false)} className="px-10 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">Done</button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8">
            <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">New Task</h2>
            <AddTaskForm userId={currentUserId} defaultProjectId={project.id} availableMembers={members} onTaskAdded={() => { loadInitialData(); setIsAddModalOpen(false); }} />
            <button onClick={() => setIsAddModalOpen(false)} className="mt-4 w-full text-slate-400 text-xs font-black uppercase tracking-widest">Close</button>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedTaskForEdit && (
        <UpdateTaskModal 
            task={selectedTaskForEdit} 
            availableMembers={members} 
            onClose={() => setIsEditModalOpen(false)} 
            onTaskUpdated={() => { loadInitialData(); setIsEditModalOpen(false); }} 
        />
      )}
    </div>
  );
};

export default ProjectDetails;