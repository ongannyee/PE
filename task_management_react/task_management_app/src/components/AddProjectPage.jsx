import React, { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { addProject, assignUserToProject } from '../API/ProjectAPI';
import { fetchAllUsers } from '../API/UserAPI';

const AddProjectPage = ({ setActivePage, currentUserId, userRole }) => {
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
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Initialize EmailJS with Public Key
    emailjs.init("eBjUNRbvoFsABoiPC");

    const getUsers = async () => {
      try {
        const users = await fetchAllUsers();
        // Filter out the current user so they don't invite themselves
        setAllUsers(users.filter(u => u.id !== currentUserId));
      } catch (err) { 
        console.error("Failed to load users", err); 
      }
    };
    getUsers();

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
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const removeUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const filteredUsers = allUsers.filter(u => {
    const isNotSelected = !selectedUsers.find(sel => sel.id === u.id);
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return isNotSelected && matchesSearch;
  });

  const sendAssignmentEmails = async (projectData, usersToNotify, newProjectId) => {
      
      const projectLink = `${window.location.origin}/projects/${newProjectId}`;

      const emailPromises = usersToNotify.map(user => {
        return emailjs.send(
          'service_vb2sbtt', 
          'template_0bcks3e', 
          {
            to_name: user.username,
            to_email: user.email,
            project_name: projectData.projectName,
            project_goal: projectData.projectGoal,
            start_date: projectData.startDate,
            project_link: projectLink 
          }
        );
      });
      return Promise.all(emailPromises);
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Create the project. 
      const newProject = await addProject({ 
        ...formData, 
        isArchived: false, 
        createdByUserId: currentUserId 
      });

      // 2. Assign team members (Contributors)
      if (selectedUsers.length > 0) {
        const assignmentPromises = selectedUsers.map(user => 
          assignUserToProject({ 
            projectId: newProject.id, 
            userId: user.id,
            projectRole: "Contributor" 
          })
        );
        await Promise.all(assignmentPromises);

        // 3. Send Emails to the team
        await sendAssignmentEmails(formData, selectedUsers);
      }

      alert(userRole === "Admin" 
        ? "Project created successfully (Admin Action)." 
        : "Project created and team notified!");
        
      if (setActivePage) setActivePage('projects'); 
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Start a New Project</h2>
        {userRole === "Admin" && (
          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded uppercase">
            Admin Mode
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4 text-left">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Name</label>
            <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Goal</label>
            <textarea name="projectGoal" value={formData.projectGoal} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500" rows="2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border rounded-md" />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t mt-6 relative" ref={wrapperRef}>
          <label className="block text-sm font-bold text-gray-700 mb-2">Assign Team Members</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedUsers.map(user => (
              <div key={user.id} className="flex items-center bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm">
                <span>{user.username}</span>
                <button type="button" onClick={() => removeUser(user.id)} className="ml-2 font-bold">&times;</button>
              </div>
            ))}
          </div>
          <input 
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showSuggestions && (
            <div className="absolute z-20 w-full bg-white border rounded-md shadow-xl mt-1 max-h-60 overflow-y-auto">
              {filteredUsers.length > 0 ? filteredUsers.map(user => (
                <div key={user.id} onClick={() => selectUser(user)} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b">
                  <div>
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-blue-500 text-xs font-bold">+ Add</div>
                </div>
              )) : <div className="p-4 text-sm text-gray-500">No users found</div>}
            </div>
          )}
        </div>

        <div className="pt-4">
          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all">
            {isSubmitting ? "Processing..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProjectPage;