import React, { useState, useEffect, useRef } from 'react';
import { 
  updateTask, 
  fetchTaskMembers, 
  assignUserToTask, 
  removeUserFromTask 
} from '../API/TaskItemAPI';

const UpdateTaskModal = ({ task, onClose, onTaskUpdated, availableMembers = [] }) => {
  const taskGuid = task?.id || task?.taskIdGuid;

  // Function to convert string status from DB/Prop to integer for form
  const getInitialStatusValue = (status) => {
    if (status === 'In Progress' || status === 'InProgress' || status === 1) return 1;
    if (status === 'Completed' || status === 'Done' || status === 2) return 2;
    return 0; // To Do
  };

  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    status: getInitialStatusValue(task.status),
    priority: task.priority === 'Medium' ? 1 : task.priority === 'High' ? 2 : task.priority === 'Urgent' ? 3 : 0,
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
  });

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchWrapperRef = useRef(null);

  // Normalize available members from the project
  const projectUsers = availableMembers.map(u => ({
    id: (u.id || u.userId || '').toString().toLowerCase(),
    username: u.username || u.userName || 'Unknown',
    email: u.email || ''
  }));

  useEffect(() => {
    const loadTaskMembers = async () => {
      if (!taskGuid || taskGuid === '00000000-0000-0000-0000-000000000000') return;
      try {
        const membersRaw = await fetchTaskMembers(taskGuid);
        const normalized = (membersRaw || []).map(u => ({
          id: (u.id || u.userId || '').toString().toLowerCase(),
          username: u.username || u.userName || 'Unknown',
          email: u.email || ''
        }));
        setSelectedUsers(normalized);
      } catch (err) {
        console.error("UpdateTaskModal: Load Error", err);
      }
    };

    loadTaskMembers();

    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [taskGuid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskGuid || taskGuid === '00000000-0000-0000-0000-000000000000') return;
    
    setIsSubmitting(true);
    try {
      // 1. Update Core Task Details
      await updateTask(taskGuid, {
        id: taskGuid,
        title: formData.title,
        description: formData.description,
        status: parseInt(formData.status),
        priority: parseInt(formData.priority),
        dueDate: formData.dueDate || null
      });

      // 2. Diff check for assignments
      const currentMembersRaw = await fetchTaskMembers(taskGuid);
      const currentIds = currentMembersRaw.map(m => (m.id || m.userId || '').toString().toLowerCase());
      const targetIds = selectedUsers.map(u => u.id.toLowerCase());

      const toAdd = selectedUsers.filter(u => !currentIds.includes(u.id));
      const toRemove = currentMembersRaw.filter(m => !targetIds.includes((m.id || m.userId || '').toString().toLowerCase()));

      for (const user of toAdd) {
        await assignUserToTask({ taskId: taskGuid, userId: user.id });
      }
      for (const user of toRemove) {
        await removeUserFromTask({ taskId: taskGuid, userId: user.id || user.userId });
      }

      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error("Update Error:", err);
      alert("Failed to update task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectUser = (user) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const removeUser = (id) => setSelectedUsers(selectedUsers.filter(u => u.id !== id));

  const filteredSuggestions = projectUsers.filter(u => 
    !selectedUsers.some(sel => sel.id === u.id) && 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 pb-4 flex justify-between items-center bg-white">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Edit Task</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-900 text-4xl font-light">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto">
          {/* Title */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Title</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className="w-full mt-2 bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
              required 
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="w-full mt-2 bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
              rows="2" 
            />
          </div>

          {/* Assignees Search & Dropdown */}
          <div className="relative" ref={searchWrapperRef}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignees</label>
            <div className="flex flex-wrap gap-2 my-2">
              {selectedUsers.map(u => (
                <span key={u.id} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center border border-blue-100">
                  {u.username} 
                  <button type="button" onClick={() => removeUser(u.id)} className="ml-2 hover:text-red-500 font-bold">×</button>
                </span>
              ))}
            </div>
            <input 
              type="text" 
              value={searchTerm} 
              onFocus={() => setShowSuggestions(true)} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Type to find members..." 
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
            />

            {/* FIXED: The Suggestions Dropdown List */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-[210] left-0 right-0 mt-2 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                {filteredSuggestions.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => selectUser(user)}
                    className="w-full text-left px-5 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-50 last:border-none"
                  >
                    <div className="flex flex-col">
                      <span>{user.username}</span>
                      <span className="text-[10px] opacity-50 font-medium">{user.email}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})} 
                className="w-full mt-2 bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value={0}>To Do</option>
                <option value={1}>In Progress</option>
                <option value={2}>Completed</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
              <select 
                value={formData.priority} 
                onChange={(e) => setFormData({...formData, priority: e.target.value})} 
                className="w-full mt-2 bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value={0}>Low</option>
                <option value={1}>Medium</option>
                <option value={2}>High</option>
                <option value={3}>Urgent</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</label>
            <input 
              type="date" 
              value={formData.dueDate} 
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})} 
              className="w-full mt-2 bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-4 rounded-2xl bg-slate-100 text-slate-500 text-[11px] font-black uppercase hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-1 px-4 py-4 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTaskModal;