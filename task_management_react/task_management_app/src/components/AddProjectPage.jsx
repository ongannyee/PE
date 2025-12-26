import React, { useState, useEffect, useRef } from 'react';
import { addProject, assignUserToProject } from '../API/ProjectAPI';
import { fetchAllUsers } from '../API/UserAPI';

const AddProjectPage = ({ setActivePage, currentUserId }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    projectGoal: '',
    startDate: '',
    endDate: ''
  });

  const [allUsers, setAllUsers] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ref to detect clicks outside the dropdown
  const wrapperRef = useRef(null);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const users = await fetchAllUsers();
        // Keep only other users
        setAllUsers(users.filter(u => u.id !== currentUserId));
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };
    getUsers();

    // Close dropdown if user clicks elsewhere on the page
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [currentUserId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectUser = (user) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm(''); // Clear search after selection
    setShowSuggestions(false); // Hide dropdown
  };

  const removeUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  // Logic: Show all users if search is empty, otherwise filter by match
  const filteredUsers = allUsers.filter(u => {
    const isNotSelected = !selectedUsers.find(sel => sel.id === u.id);
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return isNotSelected && matchesSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newProject = await addProject({ ...formData, isArchived: false });

      // 1. Assign current user (creator)
      await assignUserToProject({ projectId: newProject.id, userId: currentUserId });

      // 2. Assign all chosen team members
      const assignmentPromises = selectedUsers.map(user => 
        assignUserToProject({ projectId: newProject.id, userId: user.id })
      );
      
      await Promise.all(assignmentPromises);

      alert("Project created and team assigned!");
      if (setActivePage) setActivePage('projects'); 
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Start a New Project</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        
        {/* Basic Info Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Name</label>
            <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Goal</label>
            <textarea name="projectGoal" value={formData.projectGoal} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" rows="2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>

        {/* --- IMPROVED Team Member Selection --- */}
        <div className="pt-6 border-t mt-6 relative" ref={wrapperRef}>
          <label className="block text-sm font-bold text-gray-700 mb-2">Assign Team Members</label>
          
          {/* Selected Users Area (Chips) */}
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedUsers.map(user => (
              <div key={user.id} className="flex items-center bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm">
                <span className="font-medium">{user.username}</span>
                <button 
                  type="button" 
                  onClick={() => removeUser(user.id)}
                  className="ml-2 text-blue-400 hover:text-blue-600 font-bold"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <input 
              type="text"
              placeholder={selectedUsers.length > 0 ? "Add more..." : "Search and select users..."}
              value={searchTerm}
              onFocus={() => setShowSuggestions(true)} // Show list immediately on click
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none pr-10"
            />
            {/* Arrow icon to indicate dropdown */}
            <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
              <svg className={`w-4 h-4 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Suggestions List */}
          {showSuggestions && (
            <div className="absolute z-20 w-full bg-white border rounded-md shadow-xl mt-1 max-h-60 overflow-y-auto">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <div 
                    key={user.id}
                    onClick={() => selectUser(user)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-none transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-blue-500 text-xs font-bold">+ Add</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500 text-sm italic">
                  {searchTerm ? "No users match your search" : "No other users available"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 transition-all shadow-lg shadow-blue-200"
          >
            {isSubmitting ? "Processing..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProjectPage;