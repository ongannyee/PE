import React, { useState, useEffect } from 'react';

const UserTasks = () => {
  // 1. State to store our data
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // REPLACE THIS with the ID you copied from the browser
  const userId = "3bb18e2d-f11d-4a91-a259-6298988520fc"; 

  // 2. The Fetch Logic
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`http://localhost:5017/api/user/${userId}/tasks`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        setTasks(data); // Save data to state
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTasks();
  }, []); // Empty array means "run once when page loads"

  // 3. Render logic (What shows up on screen)
  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div style={{color: 'red'}}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>My Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks found for this user.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.taskId} style={{ marginBottom: '10px' }}>
              <strong>{task.title}</strong> - {task.status}
              <br/>
              <small>{task.description}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserTasks;