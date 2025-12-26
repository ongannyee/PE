import React, { useState, useEffect } from 'react';
import AddTaskForm from './AddTaskForm';
// 1. IMPORT API
import { fetchProjectTasks } from '../API/ProjectAPI';

const ProjectDetails = ({ project, onBack, currentUserId }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const loadProjectTasks = async () => {
      // Safety check
      if (!project) return;

      try {
        // 2. USE API FUNCTION (Fetch Tasks for this Project)
        // Ensure we pass the Project GUID (project.id), not the Int ID
        const data = await fetchProjectTasks(project.id);
        setTasks(data);
      } catch (err) {
        console.error("Failed to load project tasks:", err);
      }
    };

    loadProjectTasks();
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

      {/* Form to Add New Tasks */}
      <AddTaskForm 
        userId={currentUserId} 
        defaultProjectId={project.id} 
        onTaskAdded={() => {
            // Reload tasks when a new one is added
            fetchProjectTasks(project.id).then(setTasks);
        }} 
      />

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Project Tasks</h3>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-gray-500 italic">No tasks in this project yet.</p>
          ) : (
            tasks.map(t => (
            <div key={t.taskId} className="bg-white p-3 rounded shadow flex justify-between items-center border border-gray-100">
                <span className="font-medium text-gray-800">{t.title}</span>
                <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    t.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                    {t.status || 'Todo'}
                </span>
            </div>
          )))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;