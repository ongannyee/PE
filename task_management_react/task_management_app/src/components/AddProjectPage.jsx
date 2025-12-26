import React, { useState } from 'react';
// 1. IMPORT API
import { addProject, assignUserToProject } from '../API/ProjectAPI';

const AddProjectPage = ({ setActivePage, currentUserId }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    projectGoal: '',
    startDate: '',
    endDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 2. USE API FUNCTION (Create Project)
      const newProject = await addProject({
          projectName: formData.projectName,
          projectGoal: formData.projectGoal,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isArchived: false
      });

      // 3. USE API FUNCTION (Assign User)
      await assignUserToProject({
          projectId: newProject.id, 
          userId: currentUserId 
      });

      alert("Project created successfully!");
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
        {/* ... Inputs remain exactly the same ... */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Project Name</label>
          <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Goal</label>
          <textarea name="projectGoal" value={formData.projectGoal} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border rounded-md" />
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
        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 mt-4">
          {isSubmitting ? "Creating..." : "Create Project"}
        </button>
      </form>
    </div>
  );
};

export default AddProjectPage;