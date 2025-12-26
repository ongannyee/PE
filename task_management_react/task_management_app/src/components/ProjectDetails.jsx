import React, { useState, useEffect } from 'react';
import AddTaskForm from './AddTaskForm';

// 1. Accept 'currentUserId' from App.jsx
const ProjectDetails = ({ project, onBack, currentUserId }) => {
  const [tasks, setTasks] = useState([]);
  
  // (Hardcoded userId is GONE)

  const fetchProjectTasks = async () => {
    try {
      const response = await fetch(`http://localhost:5017/api/Project/${project.id}/tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (project) fetchProjectTasks();
  }, [project]);

  return (
    <div className="p-6">
      <button onClick={onBack} className="text-gray-500 hover:text-gray-700 mb-4">
        &larr; Back to Projects
      </button>
      
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-3xl font-bold text-gray-800">{project.projectName}</h1>
           <p className="text-gray-600">{project.projectGoal}</p>
        </div>
        <div className="text-sm text-gray-500">
            Due: {new Date(project.endDate).toLocaleDateString()}
        </div>
      </div>

      {/* 2. Pass currentUserId down to the form as 'userId' */}
      <AddTaskForm 
        userId={currentUserId} 
        defaultProjectId={project.id} 
        onTaskAdded={fetchProjectTasks} 
      />

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Project Tasks</h3>
        <div className="space-y-3">
          {tasks.length === 0 ? <p>No tasks in this project yet.</p> : tasks.map(t => (
            <div key={t.taskId} className="bg-white p-3 rounded shadow flex justify-between">
                <span>{t.title}</span>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">{t.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;