import axios from "axios";

const API_URL = "http://localhost:5017/api/user";

// --- STANDARD USER CRUD ---

// 1. ADD/REGISTER User
// Matches: [HttpPost] AddUser([FromBody] RegisterUserRequestDTO)
export const registerUser = async (userData) => {
    const response = await axios.post(API_URL, userData);
    return response.data;
};
// 1.5 LOGIN User (Add this!)
// Matches: [HttpPost("login")] (Assuming you created AuthController)
// src/API/UserAPI.js

export const loginUser = async (user) => {
  // ensure you are using the correct base URL
  const response = await fetch(`http://localhost:5017/api/User/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }

  return await response.json(); 
};

// 2. GET all users
// Matches: [HttpGet] GetAllUsers()
export const fetchAllUsers = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// 3. GET user by Integer ID
// Matches: [HttpGet("{userId:int}")] GetUserById(int userId)
export const fetchUserById = async (userIdInt) => {
    const response = await axios.get(`${API_URL}/${userIdInt}`);
    return response.data;
};

// 4. UPDATE user
// Matches: [HttpPut("{userId:int}")] UpdateUser(int userId, [FromBody] UpdateUserRequestDTO)
export const updateUser = async (userIdInt, updateData) => {
    const response = await axios.put(`${API_URL}/${userIdInt}`, updateData);
    return response.data;
};

// 5. DELETE user
// Matches: [HttpDelete("{userId:int}")] DeleteUser(int userId)
export const deleteUser = async (userIdInt) => {
    const response = await axios.delete(`${API_URL}/${userIdInt}`);
    return response.data;
};

// --- RELATIONSHIP RETRIEVAL (User Context) ---

// 6. GET all Projects a User belongs to (Requires GUID)
// Matches: [HttpGet("{userId:guid}/projects")] GetUserProjects(Guid userId)
export const fetchUserProjects = async (userGuid) => {
    const response = await axios.get(`${API_URL}/${userGuid}/projects`);
    return response.data;
};

// 7. GET all Tasks assigned to a User (Requires GUID)
// Matches: [HttpGet("{userId:guid}/tasks")] GetUserTasks(Guid userId)
export const fetchUserTasks = async (userGuid) => {
    const response = await axios.get(`${API_URL}/${userGuid}/tasks`);
    return response.data;
};

// 8. GET all Subtasks assigned to a User (Requires GUID)
// Matches: [HttpGet("{userId:guid}/subtasks")] GetUserSubTasks(Guid userId)
export const fetchUserSubTasks = async (userGuid) => {
    const response = await axios.get(`${API_URL}/${userGuid}/subtasks`);
    return response.data;
};

export const fetchProjectTasks = async (projectId) => {
  // This uses the relative path, so it automatically uses the correct port defined in your axios config
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