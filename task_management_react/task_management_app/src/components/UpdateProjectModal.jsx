import React, { useState, useEffect, useRef } from "react";
import { fetchAllUsers } from "../API/UserAPI";
import { fetchProjectMembers } from "../API/ProjectAPI";

function UpdateProjectModal({ project, onClose, onUpdate, currentUserId }) {
  const pGuid = project.id; 
  const pIntId = project.projectId;

  const [formData, setFormData] = useState({ ...project });
  const [visible, setVisible] = useState(false);
  const [allUsers, setAllUsers] = useState([]); 
  const [selectedUsers, setSelectedUsers] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchWrapperRef = useRef(null);

  useEffect(() => {
    setVisible(true);
    const loadData = async () => {
      try {
        const [usersRaw, membersRaw] = await Promise.all([
          fetchAllUsers(),
          fetchProjectMembers(pGuid)
        ]);

        const normalize = (list) => (list || []).map(u => ({
          id: (u.id || u.userId).toString().toLowerCase(),
          username: u.username,
          email: u.email
        }));

        setAllUsers(normalize(usersRaw).filter(u => u.id !== currentUserId?.toLowerCase()));
        setSelectedUsers(normalize(membersRaw));
      } catch (err) {
        console.error("Modal Load Error:", err);
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onUpdate(pIntId, { ...formData, members: selectedUsers });
    setIsSubmitting(false);
    onClose();
  };

  const selectUser = (user) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm('');
    setShowSuggestions(false);
  };

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`} 
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div 
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Edit Project</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Project Name</label>
            <input 
              name="projectName" 
              value={formData.projectName || ''} 
              onChange={(e) => setFormData({...formData, projectName: e.target.value})} 
              className="mt-1 w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Start Date</label>
              <input 
                type="date" 
                value={formData.startDate?.split('T')[0] || ''} 
                onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                className="w-full border p-2 rounded-lg" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">End Date</label>
              <input 
                type="date" 
                value={formData.endDate?.split('T')[0] || ''} 
                onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                className="w-full border p-2 rounded-lg" 
              />
            </div>
          </div>

          <div className="pt-4 border-t relative" ref={searchWrapperRef}>
            <label className="block text-sm font-bold text-gray-700 mb-2">Team Members</label>
            <div className="flex flex-wrap gap-2 mb-3 min-h-[30px]">
              {selectedUsers.map(u => (
                <div key={u.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                  {u.username}
                  <button type="button" onClick={() => setSelectedUsers(selectedUsers.filter(x => x.id !== u.id))} className="ml-2 hover:text-red-500">×</button>
                </div>
              ))}
            </div>

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
                  <div 
                    key={user.id} 
                    onClick={() => selectUser(user)} 
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b"
                  >
                    <span className="text-sm font-medium">{user.username}</span>
                    <span className="text-blue-600 text-xs font-bold">+ ADD</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProjectModal;