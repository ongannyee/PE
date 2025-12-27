import React, { useState, useEffect, useRef } from 'react';
import { createTask, assignUserToTask } from '../API/TaskItemAPI';

// Added availableMembers prop to restrict user selection
const AddTaskForm = ({ userId, onTaskAdded, defaultProjectId, availableMembers = [] }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState(1);
  const [dueDate, setDueDate] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || '');
  
  // User Assignment States
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchWrapperRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the availableMembers prop instead of fetching all users
  const projectUsers = availableMembers.map(u => ({
    id: (u.id || u.userId).toString().toLowerCase(),
    username: u.username || u.userName,
    email: u.email
  }));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return alert("Please select a project.");
    
    setIsSubmitting(true);
    try {
      const newTask = await createTask({
        title,
        description: desc,
        status: 0,
        priority: parseInt(priority),
        projectId: selectedProjectId,
        dueDate: dueDate || null 
      });

      if (newTask && newTask.id && selectedUsers.length > 0) {
        const assignmentPromises = selectedUsers.map(user => 
          assignUserToTask({
            userId: user.id,
            taskId: newTask.id 
          })
        );
        await Promise.all(assignmentPromises);
      }

      setTitle('');
      setDesc('');
      setSelectedUsers([]);
      setDueDate(''); 
      setPriority(1); 
      
      if (onTaskAdded) onTaskAdded();
    } catch (err) {
      console.error(err);
      alert("Error creating task or assigning users.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSuggestions = projectUsers.filter(u => 
    !selectedUsers.some(sel => sel.id === u.id) &&
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700">Task Name</label>
        <input 
          type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="What needs to be done?" required 
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700">Description</label>
        <textarea 
          value={desc} onChange={(e) => setDesc(e.target.value)}
          className="w-full border rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Task details..." rows="2"
        />
      </div>

      <div className="relative" ref={searchWrapperRef}>
        <label className="block text-sm font-bold text-gray-700">Assign To (Project Members Only)</label>
        <div className="flex flex-wrap gap-2 my-2">
          {selectedUsers.map(u => (
            <span key={u.id} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold flex items-center">
              {u.username}
              <button type="button" onClick={() => removeUser(u.id)} className="ml-1 text-blue-400 hover:text-red-500">×</button>
            </span>
          ))}
        </div>
        <input 
          type="text" value={searchTerm} 
          onFocus={() => setShowSuggestions(true)}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search team members..."
          className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        {showSuggestions && searchTerm && (
          <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
            {filteredSuggestions.map(u => (
              <div key={u.id} onClick={() => selectUser(u)} className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-none">
                {u.username} <span className="text-gray-400 text-xs">({u.email})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700">Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full border rounded-lg p-2 mt-1">
            <option value={0}>Low</option>
            <option value={1}>Medium</option>
            <option value={2}>High</option>
            <option value={3}>Urgent</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Due Date</label>
          <input 
            type="date" 
            value={dueDate} 
            min={today}
            onChange={(e) => setDueDate(e.target.value)} 
            className="w-full border rounded-lg p-2 mt-1" 
          />
        </div>
      </div>

      <button 
        type="submit" disabled={isSubmitting}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-lg disabled:bg-blue-300"
      >
        {isSubmitting ? "Creating & Assigning..." : "Create Task"}
      </button>
    </form>
  );
};

export default AddTaskForm;