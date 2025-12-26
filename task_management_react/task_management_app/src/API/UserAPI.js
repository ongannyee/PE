import axios from "axios";

const API_URL = "http://localhost:5017/api/user";

// --- STANDARD USER CRUD ---

// 1. REGISTER/ADD a new user
export const registerUser = async (userData) => {
    // userData: { username, email, password }
    const response = await axios.post(API_URL, userData);
    return response.data;
};

// 2. GET all users
export const fetchAllUsers = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// 3. GET user by Integer ID
export const fetchUserById = async (userIdInt) => {
    const response = await axios.get(`${API_URL}/${userIdInt}`);
    return response.data;
};

// 4. UPDATE user
export const updateUser = async (userIdInt, updateData) => {
    const response = await axios.put(`${API_URL}/${userIdInt}`, updateData);
    return response.data;
};

// 5. DELETE user
export const deleteUser = async (userIdInt) => {
    const response = await axios.delete(`${API_URL}/${userIdInt}`);
    return response.data;
};

// --- RELATIONSHIP RETRIEVAL ---

// 6. GET all Projects a User belongs to (Requires GUID)
export const fetchUserProjects = async (userGuid) => {
    const response = await axios.get(`${API_URL}/${userGuid}/projects`);
    return response.data;
};

// 7. GET all Tasks assigned to a User (Requires GUID)
export const fetchUserTasks = async (userGuid) => {
    const response = await axios.get(`${API_URL}/${userGuid}/tasks`);
    return response.data;
};

// 8. GET all Subtasks assigned to a User (Requires GUID)
export const fetchUserSubTasks = async (userGuid) => {
    const response = await axios.get(`${API_URL}/${userGuid}/subtasks`);
    return response.data;
};