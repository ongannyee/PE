import React, { useState, useEffect, useRef } from "react";
import emailjs from '@emailjs/browser';
import { fetchAllUsers } from "../API/UserAPI";
import { fetchProjectMembers } from "../API/ProjectAPI";

function UpdateProjectModal({ project, onClose, onUpdate, currentUserId, userRole }) {
  const pGuid = project.id || project.Id; 
  const pIntId = project.projectId || project.ProjectId || project.id;

  const [formData, setFormData] = useState({ ...project });
  const [visible, setVisible] = useState(false);
  const [allUsers, setAllUsers] = useState([]); 
  const [initialMembers, setInitialMembers] = useState([]); 
  const [selectedUsers, setSelectedUsers] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchWrapperRef = useRef(null);

  const canManage = userRole === "Admin" || 
                    (project.createdByUserId?.toLowerCase() === currentUserId?.toLowerCase()) ||
                    (project.CreatedByUserId?.toLowerCase() === currentUserId?.toLowerCase());

  useEffect(() => {
    emailjs.init("eBjUNRbvoFsABoiPC");
    setVisible(true);
    const loadData = async () => {
      try {
        const [usersRaw, membersRaw] = await Promise.all([
          fetchAllUsers(),
          fetchProjectMembers(pGuid)
        ]);

        const normalize = (list) => (list || []).map(u => ({
          id: (u.id || u.userId || u.UserId || "").toString().toLowerCase(),
          username: u.username || u.Username,
          email: u.email || u.Email
        }));

        const members = normalize(membersRaw);
        const users = normalize(usersRaw);

        setAllUsers(users.filter(u => u.id !== currentUserId?.toLowerCase()));
        setSelectedUsers(members);
        setInitialMembers(members); 
      } catch (err) { console.error("Modal Load Error:", err); }
    };
    loadData();

    const handleClickOutside = (event) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pGuid, currentUserId]);

  const sendAssignmentEmails = async (usersToNotify) => {
    const promises = usersToNotify.map(user => emailjs.send(
      'service_vb2sbtt', 
      'template_0bcks3e', 
      {
        to_name: user.username,
        to_email: user.email,
        project_name: formData.projectName || formData.ProjectName,
        project_goal: formData.projectGoal || formData.ProjectGoal || "Updated project details",
        start_date: formData.startDate || formData.StartDate
      }
    ));
    return Promise.all(promises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) return;
    setIsSubmitting(true);

    try {
      // Logic for email notifications
      const newMembers = selectedUsers.filter(sel => 
        !initialMembers.some(init => init.id === sel.id)
      );

      // Trigger the parent update function
      // It is vital that 'members' contains the FINAL state of the list (added and removed)
      await onUpdate(pIntId, { ...formData, members: selectedUsers });

      if (newMembers.length > 0) {
        await sendAssignmentEmails(newMembers);
      }

      onClose();
    } catch (err) {
      console.error("Update Submit Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectUser = (user) => {
    if (!canManage) return;
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const removeUser = (userId) => {
    if (!canManage) return;
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`} style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{canManage ? "Edit Project" : "Project Details"}</h2>
          {!canManage && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">View Only</span>}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Project Name</label>
            <input 
              disabled={!canManage}
              value={formData.projectName || formData.ProjectName || ''} 
              onChange={(e) => setFormData({...formData, projectName: e.target.value})} 
              className={`mt-1 w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${!canManage ? 'bg-gray-50' : ''}`} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Start Date</label>
              <input 
                type="date" 
                disabled={!canManage}
                value={formData.startDate?.split('T')[0] || formData.StartDate?.split('T')[0] || ''} 
                onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                className={`w-full border p-2 rounded-lg ${!canManage ? 'bg-gray-50' : ''}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">End Date</label>
              <input 
                type="date" 
                disabled={!canManage}
                value={formData.endDate?.split('T')[0] || formData.EndDate?.split('T')[0] || ''} 
                onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                className={`w-full border p-2 rounded-lg ${!canManage ? 'bg-gray-50' : ''}`} 
              />
            </div>
          </div>
          
          <div className="pt-4 border-t relative" ref={searchWrapperRef}>
            <label className="block text-sm font-bold text-gray-700 mb-2">Team Members</label>
            <div className="flex flex-wrap gap-2 mb-3 min-h-[30px]">
              {selectedUsers.map(u => (
                <div key={u.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                  {u.username}
                  {canManage && (
                    <button type="button" onClick={() => removeUser(u.id)} className="ml-2 hover:text-red-500">×</button>
                  )}
                </div>
              ))}
            </div>
            
            {canManage && (
              <>
                <input 
                  type="text" 
                  value={searchTerm} 
                  onFocus={() => setShowSuggestions(true)} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Search users..." 
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                />
                {showSuggestions && (
                  <div className="absolute z-50 w-full bg-white border rounded-lg shadow-xl mt-1 max-h-40 overflow-y-auto">
                    {allUsers.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedUsers.some(s => s.id === u.id)).map(user => (
                      <div key={user.id} onClick={() => selectUser(user)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b">
                        <span className="text-sm font-medium">{user.username}</span>
                        <span className="text-blue-600 text-xs font-bold">+ ADD</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg hover:bg-gray-50">
              {canManage ? "Cancel" : "Close"}
            </button>
            {canManage && (
              <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProjectModal;