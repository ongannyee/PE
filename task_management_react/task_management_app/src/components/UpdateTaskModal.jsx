import React, { useState, useEffect, useRef } from 'react';
import { fetchAllUsers } from '../API/UserAPI';
import { 
  updateTask, 
  fetchTaskMembers, 
  assignUserToTask, 
  removeUserFromTask 
} from '../API/TaskItemAPI';

const UpdateTaskModal = ({ task, onClose, onTaskUpdated }) => {
  // --- GUID SELECTION LOGIC ---
  // We check for 'id', then 'taskIdGuid' (common in C# DTOs)
  // If you see '0000...', it means 'task.id' exists but is empty.
  const taskGuid = task?.id || task?.taskIdGuid;

  // Debugging: This will show you exactly what GUID the modal received
  console.log("Task received in Modal:", task);
  console.log("Extracted taskGuid:", taskGuid);

  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
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
      // Logic check for "all zeros" or undefined
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
    
    // Safety check before calling API
    if (!taskGuid || taskGuid === '00000000-0000-0000-0000-000000000000') {
        alert("Cannot save: Task GUID is invalid (all zeros).");
        return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Update the Text Fields (Uses integer taskId for route)
      await updateTask(task.taskId, {
        ...task,
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
      alert("Failed to update task. Check console for details.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold text-gray-800">Edit Task</h2>
            <span className="text-xs text-gray-400 font-mono">ID: {task.taskId}</span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700">Title</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-400 outline-none" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Description</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-400 outline-none" 
              rows="3" 
            />
          </div>

          <div className="relative" ref={searchWrapperRef}>
            <label className="block text-sm font-bold text-gray-700">Assignees</label>
            <div className="flex flex-wrap gap-2 my-2">
              {selectedUsers.map(u => (
                <span key={u.id} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold flex items-center">
                  {u.username} 
                  <button type="button" onClick={() => removeUser(u.id)} className="ml-1 text-blue-400 hover:text-red-500 font-bold">×</button>
                </span>
              ))}
            </div>
            <input 
              type="text" 
              value={searchTerm} 
              onFocus={() => setShowSuggestions(true)} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Search users..." 
              className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" 
            />
            {showSuggestions && searchTerm && (
              <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map(u => (
                    <div 
                      key={u.id} 
                      onClick={() => selectUser(u)} 
                      className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-none"
                    >
                      {u.username} <span className="text-gray-400 text-xs">({u.email})</span>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">No users found.</div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">Status</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})} 
                className="w-full border rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value={0}>Todo</option>
                <option value={1}>In Progress</option>
                <option value={2}>Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">Priority</label>
              <select 
                value={formData.priority} 
                onChange={(e) => setFormData({...formData, priority: e.target.value})} 
                className="w-full border rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value={0}>Low</option>
                <option value={1}>Medium</option>
                <option value={2}>High</option>
                <option value={3}>Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Due Date</label>
            <input 
              type="date" 
              value={formData.dueDate} 
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})} 
              className="w-full border rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all disabled:bg-blue-300"
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