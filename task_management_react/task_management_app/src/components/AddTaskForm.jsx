import React, { useState, useEffect } from 'react';
// 1. IMPORT API FUNCTIONS
import { fetchUserProjects } from '../API/UserAPI';
import { createTask, assignUserToTask } from '../API/TaskItemAPI';

const AddTaskForm = ({ userId, onTaskAdded, defaultProjectId }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || '');
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(!defaultProjectId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultProjectId) {
        setSelectedProjectId(defaultProjectId);
        return; 
    }

    const loadProjects = async () => {
      try {
        // 2. USE API (Fetch Projects)
        const data = await fetchUserProjects(userId);
        setProjects(data);
        if (data.length > 0) setSelectedProjectId(data[0].id);
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoadingProjects(false);
      }
    };

    if (userId) loadProjects();
  }, [userId, defaultProjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      alert("No project selected.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 3. USE API (Create Task)
      const newTask = await createTask({
          title: title,
          description: desc,
          status: 0, 
          priority: 1, 
          projectId: selectedProjectId
      });

      // 4. USE API (Assign User)
      await assignUserToTask({
          userId: userId,
          taskId: newTask.id 
      });

      setTitle('');
      setDesc('');
      if (onTaskAdded) onTaskAdded(); 

    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold mb-3 text-gray-700">Add New Task</h3>
      
      {!defaultProjectId && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700">Project</label>
          {loadingProjects ? <p>Loading...</p> : (
            <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.projectName}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* ... Inputs remain the same ... */}
      <div className="mb-3">
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="Task name"
          required
        />
      </div>
       <div className="mb-3">
        <textarea 
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="Details..."
        />
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        {isSubmitting ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
};

export default AddTaskForm;