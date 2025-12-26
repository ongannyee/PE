import React, { useState, useEffect, useRef } from 'react';
import { fetchAllUsers } from '../API/UserAPI';
import { 
  updateTask, 
  fetchTaskMembers, 
  assignUserToTask, 
  removeUserFromTask 
} from '../API/TaskItemAPI';

const UpdateTaskModal = ({ task, onClose, onTaskUpdated }) => {
  // Use 'id' (Guid) as the primary identifier
  const taskGuid = task?.id || task?.taskIdGuid;

  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    // Logic to map string status to backend integers if necessary
    status: task.status === 'InProgress' ? 1 : task.status === 'Done' ? 2 : 0,
    priority: task.priority === 'Medium' ? 1 : task.priority === 'High' ? 2 : task.priority === 'Urgent' ? 3 : 0,
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
  });

  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchWrapperRef = useRef(null);

  // Load All Users and Current Task Members
  useEffect(() => {
    const loadData = async () => {
      if (!taskGuid || taskGuid === '00000000-0000-0000-0000-000000000000') {
        console.error("UpdateTaskModal: Invalid or Empty GUID detected!");
        return;
      }

      try {
        const [usersRaw, membersRaw] = await Promise.all([
          fetchAllUsers(),
          fetchTaskMembers(taskGuid)
        ]);

        const normalize = (list) => (list || []).map(u => ({
          id: (u.id || u.userId || '').toString().toLowerCase(),
          username: u.username || u.userName || 'Unknown',
          email: u.email || ''
        }));

        setAllUsers(normalize(usersRaw));
        setSelectedUsers(normalize(membersRaw));
      } catch (err) {
        console.error("UpdateTaskModal: Load Error", err);
      }
    };

    loadData();
  }, [taskGuid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!taskGuid || taskGuid === '00000000-0000-0000-0000-000000000000') {
        alert("Cannot save: Task GUID is invalid.");
        return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Update the Text Fields - Passing the GUID (taskGuid) instead of taskId
      await updateTask(taskGuid, {
        id: taskGuid, // Ensure ID is in body if backend requires it
        title: formData.title,
        description: formData.description,
        status: parseInt(formData.status),
        priority: parseInt(formData.priority),
        dueDate: formData.dueDate || null
      });

      // 2. Sync Members
      const currentMembersRaw = await fetchTaskMembers(taskGuid);
      const currentIds = currentMembersRaw.map(m => (m.id || m.userId || '').toLowerCase());
      const targetIds = selectedUsers.map(u => u.id.toLowerCase());

      const toAdd = selectedUsers.filter(u => !currentIds.includes(u.id));
      const toRemove = currentMembersRaw.filter(m => !targetIds.includes(m.id));

      // Use the verified taskGuid for assignments
      for (const user of toAdd) {
        await assignUserToTask({ taskId: taskGuid, userId: user.id });
      }

      for (const user of toRemove) {
        await removeUserFromTask({ taskId: taskGuid, userId: user.id });
      }

      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error("Update Error:", err);
      alert("Failed to update task. Ensure the backend is expecting a GUID.");
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

  const removeUser = (id) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== id));
  };

  const filteredSuggestions = allUsers.filter(u => 
    !selectedUsers.some(sel => sel.id === u.id) && 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 pb-0 flex justify-between items-center">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Edit Task</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-900 text-4xl font-light">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
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

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="w-full mt-2 bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
              rows="2" 
            />
          </div>

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
              placeholder="Search users..." 
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
            />
            {showSuggestions && searchTerm && (
              <div className="absolute z-10 w-full bg-white border border-slate-100 rounded-2xl shadow-xl mt-2 max-h-40 overflow-y-auto overflow-x-hidden">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map(u => (
                    <div 
                      key={u.id} 
                      onClick={() => selectUser(u)} 
                      className="p-4 hover:bg-slate-50 cursor-pointer text-sm border-b border-slate-50 last:border-none flex justify-between items-center"
                    >
                      <span className="font-bold text-slate-700">{u.username}</span>
                      <span className="text-slate-400 text-xs">{u.email}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-xs text-slate-400">No users found.</div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})} 
                className="w-full mt-2 bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value={0}>Todo</option>
                <option value={1}>In Progress</option>
                <option value={2}>Done</option>
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

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</label>
            <input 
              type="date" 
              value={formData.dueDate} 
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})} 
              className="w-full mt-2 bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-4 rounded-2xl bg-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-1 px-4 py-4 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
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