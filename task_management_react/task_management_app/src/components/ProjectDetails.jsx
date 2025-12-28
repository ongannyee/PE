import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AddTaskForm from './AddTaskForm';
import UpdateTaskModal from './UpdateTaskModal';
import SubtaskList from './SubtaskList';
import CommentSection from './CommentSection';
import ProjectPieChart from './ProjectPieChart';
import ProjectBarChart from './ProjectBarChart';
import ProjectLineChart from './ProjectLineChart';
import DataTable from './DataTable';

import { fetchProjectTasks, fetchProjectMembers, fetchProjects } from '../API/ProjectAPI';
import { fetchUserTasks } from '../API/UserAPI'; 
import { deleteTask, fetchSubTasksByTask } from '../API/TaskItemAPI';
import { fetchTaskAttachments } from '../API/TaskItemAPI';
import { fetchSubTaskAttachments } from '../API/SubtaskAPI';
import { uploadToTask, deleteAttachment } from '../API/AttachmentAPI';

const ProjectDetails = ({ currentUserId, userRole }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberWorkloads, setMemberWorkloads] = useState([]); 
  const [activeTab, setActiveTab] = useState('tasks'); 
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSortedByPriority, setIsSortedByPriority] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [fileTargetTask, setFileTargetTask] = useState(null);
  const [taskFiles, setTaskFiles] = useState([]);
  const [subtaskFilesMap, setSubtaskFilesMap] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [isFilesLoading, setIsFilesLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const priorityWeight = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };

  useEffect(() => {
    let isMounted = true;
    const getProjectInfo = async () => {
      try {
        setIsLoading(true);
        const all = await fetchProjects(currentUserId, userRole);
        const match = all.find(p => (p.id || p.projectId || p.ProjectId) === projectId);
        
        if (isMounted) {
          if (match) {
            setProject(match);
          } else {
            console.error("Project not found in user's authorized list");
            navigate('/projects'); 
          }
        }
      } catch (err) {
        console.error("Failed to fetch project info", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (projectId && currentUserId) {
      getProjectInfo();
    }
    return () => { isMounted = false; };
  }, [projectId, currentUserId, userRole, navigate]);

  const canManage = useMemo(() => {
    if (!project) return false;
    if (userRole === "Admin") return true;
    const creatorId = (project.createdByUserId || project.CreatedByUserId || "").toLowerCase();
    const myId = (currentUserId || "").toLowerCase();
    return creatorId === myId && myId !== "";
  }, [project, currentUserId, userRole]);

  const getCalculatedStatusLabel = (t, total, completed) => {
    if (total > 0) {
      if (completed === total) return 'Completed';
      if (completed > 0) return 'In Progress';
      return 'To Do';
    }
    const s = String(t.status ?? "").toLowerCase();
    if (s === '2' || s === 'completed' || s === 'done') return 'Completed';
    if (s === '1' || s === 'inprogress' || s === 'in progress') return 'In Progress';
    return 'To Do';
  };

  /**
   * HELPER: Check if task is overdue
   */
  const checkIsOverdue = (dueDate, statusLabel) => {
    if (!dueDate || statusLabel === 'Completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison
    const taskDate = new Date(dueDate);
    return taskDate < today;
  };

  const loadInitialData = useCallback(async () => {
    if (!projectId) return;
    try {
      const [taskData, memberData] = await Promise.all([
        fetchProjectTasks(projectId),
        fetchProjectMembers(projectId)
      ]);

      const tasksWithProgress = await Promise.all((taskData || []).map(async (t) => {
        const subs = await fetchSubTasksByTask(t.id);
        const total = subs.length;
        const completed = subs.filter(s => s.isCompleted).length;
        const autoStatus = getCalculatedStatusLabel(t, total, completed);

        return {
          ...t,
          totalSubs: total,
          completedSubs: completed,
          calculatedStatus: autoStatus
        };
      }));

      setTasks(tasksWithProgress);
      setMembers(memberData || []);

      const workloadResults = await Promise.all((memberData || []).map(async (m) => {
        const mId = m.id || m.userId || m.guid;
        const userTasks = await fetchUserTasks(mId);
        const projectSpecificTasks = userTasks.filter(ut => (ut.projectId || ut.ProjectId) === projectId);

        return {
          name: m.username || 'User',
          todo: projectSpecificTasks.filter(ut => getCalculatedStatusLabel(ut, 0, 0) === 'To Do').length,
          inprogress: projectSpecificTasks.filter(ut => getCalculatedStatusLabel(ut, 0, 0) === 'In Progress').length,
          completed: projectSpecificTasks.filter(ut => getCalculatedStatusLabel(ut, 0, 0) === 'Completed').length,
        };
      }));

      setMemberWorkloads(workloadResults);
    } catch (err) {
      console.error("Error loading project details:", err);
    }
  }, [projectId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const analytics = useMemo(() => {
    const pie = [
      { name: 'Completed', value: tasks.filter(t => t.calculatedStatus === 'Completed').length },
      { name: 'In Progress', value: tasks.filter(t => t.calculatedStatus === 'In Progress').length },
      { name: 'To Do', value: tasks.filter(t => t.calculatedStatus === 'To Do').length },
    ];

    const sortedForLine = [...tasks].filter(t => t.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const line = sortedForLine.map((t, idx) => ({
      date: new Date(t.dueDate).toLocaleDateString(),
      actual: Math.round((tasks.filter(tk => tk.calculatedStatus === 'Completed' && new Date(tk.dueDate) <= new Date(t.dueDate)).length / (tasks.length || 1)) * 100),
      expected: Math.round(((idx + 1) / (tasks.length || 1)) * 100)
    }));

    return { pie, line };
  }, [tasks]);

  const getStatusInfo = (task) => {
    const statusLabel = task.calculatedStatus || 'To Do';
    switch (statusLabel) {
      case 'Completed': return { label: 'Completed', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      case 'In Progress': return { label: 'In Progress', color: 'bg-amber-50 text-amber-600 border-amber-100' };
      default: return { label: 'To Do', color: 'bg-slate-100 text-slate-500 border-slate-200' };
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
    } catch (err) { console.error("Error loading task resources:", err); }
    finally { setIsFilesLoading(false); }
  };

  const handleUploadToTask = async () => {
    if (!uploadFile || !fileTargetTask || !currentUserId) return;
    setIsUploading(true);
    try {
      await uploadToTask(uploadFile, fileTargetTask.id, currentUserId);
      setUploadFile(null);
      const updated = await fetchTaskAttachments(fileTargetTask.id);
      setTaskFiles(updated || []);
    } catch (err) { alert(err.response?.data || "Upload failed."); }
    finally { setIsUploading(false); }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Delete this file permanently?") || !currentUserId) return;
    try {
      await deleteAttachment(fileId, currentUserId);
      setTaskFiles(prev => prev.filter(f => (f.id || f.attachmentId || f.attachmentGuid) !== fileId));
    } catch (err) { alert(err.response?.data || "Delete failed."); }
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

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">Synchronizing Project Data...</p>
    </div>
  );

  if (!project) return null;

  const displayedTasks = isSortedByPriority
    ? [...tasks].sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0))
    : tasks;

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen text-left">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate('/projects')} className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Projects
        </button>
        <div className="flex gap-3">
          <button onClick={() => setIsSortedByPriority(!isSortedByPriority)} className={`px-4 py-2.5 rounded-xl font-bold transition-all border flex items-center gap-2 ${isSortedByPriority ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-inner' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}>
            <span>{isSortedByPriority ? '🔼 Priority Sorted' : 'Sort by Priority'}</span>
          </button>
          {canManage && (
            <button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all">+ New Task</button>
          )}
        </div>
      </div>

      {/* PROJECT INFO BANNER */}
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 mb-10">
        <div className="flex justify-between items-start">
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

        <div className="flex gap-8 mt-10 border-b border-slate-100">
          <button onClick={() => setActiveTab('tasks')} className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'tasks' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            Task Board ({tasks.length})
          </button>
          <button onClick={() => setActiveTab('stats')} className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            Analytics & Stats
          </button>
        </div>
      </div>

      {activeTab === 'tasks' ? (
        <div className="space-y-4 pb-20">
          {displayedTasks.map(t => {
            const status = getStatusInfo(t);
            const progressPercent = (t.completedSubs / (t.totalSubs || 1)) * 100;
            const isOverdue = checkIsOverdue(t.dueDate, status.label);
            
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
                        
                        {/* DUE DATE WITH OVERDUE COLORING */}
                        <span className={`text-xs font-bold flex items-center gap-1 transition-colors ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                          {isOverdue ? '⚠️' : '📅'} {new Date(t.dueDate).toLocaleDateString()}
                          {isOverdue && <span className="text-[10px] font-black uppercase tracking-tighter">(Overdue)</span>}
                        </span>

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
                    {canManage && (
                      <>
                        <button onClick={(e) => handleEditClick(e, t)} className="p-3 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">✏️</button>
                        <button onClick={(e) => handleDeleteTask(e, t.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">🗑️</button>
                      </>
                    )}
                    <div className={`ml-2 text-slate-300 transition-transform ${expandedTaskId === t.id ? 'rotate-180' : ''}`}>▼</div>
                  </div>
                </div>
                {expandedTaskId === t.id && (
                  <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/50 to-white flex flex-col md:flex-row min-h-[500px]">
                    <div className="flex-1 p-10 border-r border-slate-100">
                      <SubtaskList 
                        taskGuid={t.id} 
                        onSubtaskStatusChange={loadInitialData} 
                        currentUserId={currentUserId}
                        userRole={userRole}
                        projectCreatorId={project.createdByUserId || project.CreatedByUserId}
                      />
                    </div>
                    <div className="flex-1 p-10 bg-white/40">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-6">Discussion Board</span>
                      <CommentSection taskGuid={t.id} taskName={t.title} currentUserId={currentUserId} projectId={projectId} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-10 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProjectPieChart data={analytics.pie} />
            <ProjectBarChart data={memberWorkloads} />
          </div>
          <ProjectLineChart data={analytics.line} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DataTable title="Status Distribution" headers={['Status', 'Count']} rows={analytics.pie} />
            <DataTable title="Team Workload" headers={['Member', 'To Do', 'In Progress', 'Done']} rows={memberWorkloads.map(b => ({ name: b.name, todo: b.todo, inprogress: b.inprogress, done: b.completed }))} />
          </div>
        </div>
      )}

      {/* RESOURCE EXPLORER MODAL */}
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
              
              {(canManage || userRole === "Contributor") && (
                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-3 text-center">Upload to Task Resources</label>
                  <div className="flex gap-3">
                    <input type="file" id="task-direct-upload" className="hidden" onChange={(e) => setUploadFile(e.target.files[0])} />
                    <label htmlFor="task-direct-upload" className="flex-1 bg-white border-2 border-dashed border-blue-200 rounded-2xl p-4 text-sm font-bold text-slate-500 text-center cursor-pointer hover:border-blue-400 transition-all truncate">
                      {uploadFile ? `📄 ${uploadFile.name}` : "Drop file here or click to browse"}
                    </label>
                    <button onClick={handleUploadToTask} disabled={!uploadFile || isUploading} className="bg-slate-900 text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50">
                      {isUploading ? "..." : "Upload"}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">Direct Task Files</h5>
                <div className="space-y-2">
                  {isFilesLoading ? <p className="text-slate-400 text-[10px] animate-pulse">Checking for files...</p> : 
                   taskFiles.length > 0 ? taskFiles.map(file => {
                     const uploaderId = (file.uploadedByUserId || file.userId || "").toString().toLowerCase();
                     const myId = (currentUserId || "").toString().toLowerCase();
                     const showDelete = canManage || (uploaderId === myId && myId !== "");

                     return (
                      <div key={file.id || file.attachmentId} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="text-2xl opacity-50">📄</span>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-800 truncate">{file.fileName}</p>
                            <p className="text-[9px] text-slate-400 font-medium">Uploaded by: {file.uploaderName || 'Team Member'}</p>
                          </div>
                        </div>
                        <div className="flex gap-3 ml-4 whitespace-nowrap">
                          <a href={`http://localhost:5017${file.fileUrl}`} target="_blank" rel="noreferrer" className="text-[9px] font-black text-blue-600 uppercase hover:underline">Download</a>
                          {showDelete && (
                            <button onClick={() => handleDeleteFile(file.id || file.attachmentId)} className="text-[9px] font-black text-red-400 uppercase">Delete</button>
                          )}
                        </div>
                      </div>
                    )}) : <p className="text-slate-400 text-[10px] italic">No root files found.</p>}
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
            <AddTaskForm userId={currentUserId} defaultProjectId={projectId} availableMembers={members} onTaskAdded={() => { loadInitialData(); setIsAddModalOpen(false); }} />
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