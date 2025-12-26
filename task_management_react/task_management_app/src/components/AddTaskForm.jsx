import React, { useState, useEffect } from 'react';

const AddTaskForm = ({ userId, onTaskAdded, defaultProjectId }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  
  // If a default is passed, use it. Otherwise start empty.
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || '');
  
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(!defaultProjectId); // Only load if we don't have a default
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch User's Projects ONLY if no defaultProjectId is provided
  useEffect(() => {
    if (defaultProjectId) {
        setSelectedProjectId(defaultProjectId);
        return; 
    }

    const fetchProjects = async () => {
      try {
        const response = await fetch(`http://localhost:5017/api/user/${userId}/projects`);
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
          if (data.length > 0) setSelectedProjectId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoadingProjects(false);
      }
    };

    if (userId) fetchProjects();
  }, [userId, defaultProjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      alert("No project selected.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create Task
      const createResponse = await fetch('http://localhost:5017/api/Task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          description: desc,
          status: 0, 
          priority: 1, 
          projectId: selectedProjectId // Uses the passed prop OR the dropdown value
        }),
      });

      if (!createResponse.ok) throw new Error("Failed to create task");
      
      const newTask = await createResponse.json();

      // Assign to User
      const assignResponse = await fetch('http://localhost:5017/api/Task/AssignUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          taskId: newTask.id // Ensure we use the GUID
        }),
      });

      if (!assignResponse.ok) throw new Error("Task created but assignment failed.");

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
      
      {/* Only show dropdown if NO default project was passed */}
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
       {/* ... Description input remains the same ... */}
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