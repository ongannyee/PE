import axios from "axios";

const API_URL = "http://localhost:5017/api/user";

// --- STANDARD USER CRUD ---

export const registerUser = async (userData) => {
    const response = await axios.post(API_URL, userData);
    return response.data;
};

export const loginUser = async (user) => {
  const response = await fetch(`http://localhost:5017/api/Auth/login`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }
  return await response.json(); 
};
// ------------------------------------------------

export const fetchAllUsers = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const fetchUserById = async (userIdInt) => {
    const response = await axios.get(`${API_URL}/${userIdInt}`);
    return response.data;
};

export const updateUser = async (userIdInt, updateData) => {
    const response = await axios.put(`${API_URL}/${userIdInt}`, updateData);
    return response.data;
};

export const deleteUser = async (userIdInt) => {
    const response = await axios.delete(`${API_URL}/${userIdInt}`);
    return response.data;
};

// --- RELATIONSHIP RETRIEVAL ---

export const fetchUserProjects = async (userGuid) => {
    const response = await axios.get(`${API_URL}/${userGuid}/projects`);
    return response.data;
};

export const fetchUserTasks = async (userGuid) => {
    const response = await axios.get(`${API_URL}/${userGuid}/tasks`);
    return response.data;
};

export const fetchUserSubTasks = async (userGuid) => {
    const response = await axios.get(`${API_URL}/${userGuid}/subtasks`);
    return response.data;
};

export const fetchProjectTasks = async (projectId) => {
  const response = await fetch(`http://localhost:5017/api/Project/${projectId}/tasks`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks for project ${projectId}`);
  }

  return await response.json();
};