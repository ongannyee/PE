import React, { useState, useEffect } from 'react';
import {
  createSubTask, 
  updateSubTask, 
  deleteSubTask,
  assignUserToSubTask,
  removeUserFromSubTask,
  fetchSubTaskMembers,
  fetchSubTaskAttachments
} from '../API/SubtaskAPI';
import { fetchSubTasksByTask, fetchTaskMembers } from '../API/TaskItemAPI';
import { uploadToSubTask, deleteAttachment } from '../API/AttachmentAPI'; 

const SubtaskList = ({ taskGuid, onSubtaskStatusChange }) => {
  const [subtasks, setSubtasks] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadData = async () => {
    if (!taskGuid || taskGuid === "00000000-0000-0000-0000-000000000000") return;
    setLoading(true);
    try {
      const [subtaskData, memberData] = await Promise.all([
        fetchSubTasksByTask(taskGuid),
        fetchTaskMembers(taskGuid) 
      ]);
      
      const normalizedAvailable = (memberData || []).map(m => ({
        id: (m.id || m.userId || '').toString().toLowerCase(),
        username: m.username || m.userName || 'Unknown'
      }));

      const subtasksWithFullDetails = await Promise.all(subtaskData.map(async (st) => {
        try {
          const [members, attachments] = await Promise.all([
            fetchSubTaskMembers(st.id),
            fetchSubTaskAttachments(st.id)
          ]);
          return { 
            ...st, 
            assignedMembers: (members || []).map(m => ({
                id: (m.id || m.userId || '').toString().toLowerCase(),
                username: m.username || m.userName
            })), 
            attachments: attachments || [] 
          };
        } catch (err) {
          return { ...st, assignedMembers: [], attachments: [] };
        }
      }));

      setSubtasks(subtasksWithFullDetails);
      setAvailableMembers(normalizedAvailable);
    } catch (err) {
      console.error("Initialization Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [taskGuid]);

  // Helper to notify parent component (ProjectDetails) to refresh progress
  const notifyParent = () => {
    if (onSubtaskStatusChange) {
      onSubtaskStatusChange();
    }
  };

  // --- ATTACHMENT HANDLERS ---

  const handleUploadFile = async () => {
    if (!selectedFile || !editingSubtask) return;
    setIsUploading(true);
    try {
      await uploadToSubTask(selectedFile, editingSubtask.id);
      const updatedAttachments = await fetchSubTaskAttachments(editingSubtask.id);
      setEditingSubtask(prev => ({ ...prev, attachments: updatedAttachments }));
      setSelectedFile(null);
      loadData();
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = async (attachmentId) => {
    if (!window.confirm("Permanently delete this file?")) return;
    try {
      await deleteAttachment(attachmentId);
      setEditingSubtask(prev => ({
        ...prev,
        attachments: prev.attachments.filter(a => (a.id || a.attachmentId) !== attachmentId)
      }));
      loadData();
    } catch (err) {
      alert("Failed to delete attachment.");
    }
  };

  // --- CRUD HANDLERS ---

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    try {
      await createSubTask(taskGuid, { title: newSubtaskTitle });
      setNewSubtaskTitle('');
      await loadData();
      notifyParent(); // Refresh progress bar in ProjectDetails
    } catch (err) {
      alert("Failed to create subtask.");
    }
  };

  const handleToggleComplete = async (st) => {
    try {
      await updateSubTask(st.id, { title: st.title, isCompleted: !st.isCompleted });
      await loadData();
      notifyParent(); // Refresh progress bar in ProjectDetails
    } catch (err) {
      console.error("Toggle Error:", err);
    }
  };

  const handleDelete = async (guidId) => {
    if (!window.confirm("Delete this subtask?")) return;
    try {
      await deleteSubTask(guidId);
      await loadData();
      notifyParent(); // Refresh progress bar in ProjectDetails
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const handleAssignUser = async (userId) => {
    if (!userId) return;
    try {
      await assignUserToSubTask({ subTaskId: editingSubtask.id, userId: userId });
      const updatedMembers = await fetchSubTaskMembers(editingSubtask.id);
      const normalized = updatedMembers.map(m => ({
        id: (m.id || m.userId).toString().toLowerCase(),
        username: m.username || m.userName
      }));
      setEditingSubtask({ ...editingSubtask, assignedMembers: normalized });
      setSelectedUserId('');
      loadData();
    } catch (err) {
      alert("Failed to assign user.");
    }
  };

  const handleUnassignUser = async (userId) => {
    try {
      await removeUserFromSubTask({ subTaskId: editingSubtask.id, userId: userId });
      const updatedMembers = await fetchSubTaskMembers(editingSubtask.id);
      const normalized = updatedMembers.map(m => ({
        id: (m.id || m.userId).toString().toLowerCase(),
        username: m.username || m.userName
      }));
      setEditingSubtask({ ...editingSubtask, assignedMembers: normalized });
      loadData();
    } catch (err) {
      console.error("Unassign Error:", err);
    }
  };

  const openEditModal = (st) => {
    setEditingSubtask(st);
    setEditTitle(st.title);
    setSelectedUserId(''); 
    setIsEditModalOpen(true);
  };

  const openAttachmentModal = (st) => {
    setEditingSubtask(st);
    setSelectedFile(null);
    setIsAttachmentModalOpen(true);
  };

  const handleSaveTitle = async () => {
    try {
      await updateSubTask(editingSubtask.id, {
        title: editTitle,
        isCompleted: editingSubtask.isCompleted
      });
      setIsEditModalOpen(false);
      await loadData(); 
      notifyParent();
    } catch (err) {
      alert("Error saving title.");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddSubtask} className="relative group">
        <input
          type="text"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="Add a step to this task..."
          className="w-full bg-slate-100 border-none rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all pr-20"
        />
        <button type="submit" className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-5 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all">
          Add
        </button>
      </form>

      <div className="space-y-3">
        {loading && <p className="text-center text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest">Refreshing list...</p>}
        {subtasks.map((st) => (
          <div key={st.id} className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${st.isCompleted ? 'bg-slate-50 opacity-60' : 'bg-white hover:border-blue-200 shadow-sm'}`}>
            <div className="flex items-center gap-4 flex-1">
              <input type="checkbox" checked={st.isCompleted} onChange={() => handleToggleComplete(st)} className="w-5 h-5 rounded-lg text-blue-600 cursor-pointer" />
              <div className="flex flex-col">
                <span className={`text-sm font-semibold ${st.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>{st.title}</span>
                
                {st.attachments?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {st.attachments.map(a => (
                      <span key={a.id || a.attachmentId} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
                        📎 {a.fileName}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex -space-x-2 mt-2">
                  {st.assignedMembers?.map((m) => (
                    <div key={m.id} title={m.username} className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                      {m.username?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={() => openAttachmentModal(st)} title="Manage Attachments" className="p-2 text-slate-400 hover:text-indigo-500">📎</button>
              <button onClick={() => openEditModal(st)} title="Edit Details" className="p-2 text-slate-400 hover:text-blue-500">✏️</button>
              <button onClick={() => handleDelete(st.id)} title="Delete Subtask" className="p-2 text-slate-400 hover:text-red-500">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Step Details</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-300 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtask Title</label>
                <input className="w-full mt-2 bg-slate-50 border-none rounded-2xl p-4 text-sm" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Members</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editingSubtask?.assignedMembers?.map(m => (
                    <div key={m.id} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold">
                      {m.username}
                      <button onClick={() => handleUnassignUser(m.id)} className="hover:text-red-500">✕</button>
                    </div>
                  ))}
                </div>
                <select className="w-full mt-3 bg-slate-50 border-none rounded-2xl p-4 text-sm" value={selectedUserId} onChange={(e) => handleAssignUser(e.target.value)}>
                  <option value="">Assign Member...</option>
                  {availableMembers.filter(am => !editingSubtask?.assignedMembers?.some(em => em.id === am.id)).map(member => (
                    <option key={member.id} value={member.id}>{member.username}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-8 pt-4 border-t border-slate-100">
              <button onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-4 rounded-2xl bg-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-widest">Close</button>
              <button onClick={handleSaveTitle} className="flex-1 px-4 py-4 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">Save Title</button>
            </div>
          </div>
        </div>
      )}

      {/* ATTACHMENT MODAL */}
      {isAttachmentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Attachments</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{editingSubtask?.title}</p>
              </div>
              <button onClick={() => setIsAttachmentModalOpen(false)} className="text-slate-300 hover:text-slate-600">✕</button>
            </div>
            
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-2">
                {editingSubtask?.attachments?.map(file => (
                  <div key={file.id || file.attachmentId} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <a href={`http://localhost:5017${file.fileUrl}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline truncate max-w-[200px]">
                      📄 {file.fileName}
                    </a>
                    <button onClick={() => handleRemoveAttachment(file.id || file.attachmentId)} className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase">Delete</button>
                  </div>
                ))}
                {editingSubtask?.attachments?.length === 0 && <p className="text-center py-4 text-xs text-slate-400 font-medium italic">No files attached yet.</p>}
              </div>

              <div className="pt-4 border-t border-slate-50">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input type="file" id="sub-file-indep" className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
                    <label htmlFor="sub-file-indep" className="flex items-center justify-center w-full p-3 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 hover:bg-slate-50 cursor-pointer truncate">
                      {selectedFile ? selectedFile.name : "+ Select File"}
                    </label>
                  </div>
                  {selectedFile && (
                    <button 
                      onClick={handleUploadFile}
                      disabled={isUploading}
                      className="bg-indigo-600 text-white px-4 rounded-2xl text-[10px] font-black uppercase disabled:opacity-50"
                    >
                      {isUploading ? "Uploading..." : "Upload"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setIsAttachmentModalOpen(false)} className="w-full mt-6 px-4 py-4 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest">Done</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubtaskList;