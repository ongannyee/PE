import axios from "axios";

const API_URL = "http://localhost:5017/api/task";

// --- STANDARD CRUD OPERATIONS ---

// 1. GET all tasks
export const fetchAllTasks = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// 2. GET task by Integer ID
export const fetchTaskById = async (taskIdInt) => {
    const response = await axios.get(`${API_URL}/${taskIdInt}`);
    return response.data;
};

// 3. CREATE a new task
export const createTask = async (taskData) => {
    // taskData: { title, description, status (int), priority (int), dueDate, projectId (guid) }
    const response = await axios.post(API_URL, taskData);
    return response.data;
};

// 4. UPDATE a task
export const updateTask = async (taskIdInt, updateData) => {
    const response = await axios.put(`${API_URL}/${taskIdInt}`, updateData);
    return response.data;
};

// 5. DELETE a task
export const deleteTask = async (taskIdInt) => {
    const response = await axios.delete(`${API_URL}/${taskIdInt}`);
    return response.data;
};

// --- ASSOCIATION & RELATIONSHIP METHODS ---

// 6. ASSIGN User to Task
export const assignUserToTask = async (assignmentData) => {
    // assignmentData: { userId: "guid", taskId: "guid" }
    const response = await axios.post(`${API_URL}/AssignUser`, assignmentData);
    return response.data;
};

// 7. REMOVE User from Task
export const removeUserFromTask = async (assignmentData) => {
    // assignmentData: { userId: "guid", taskId: "guid" }
    const response = await axios.delete(`${API_URL}/RemoveUser`, { data: assignmentData });
    return response.data;
};

// 8. GET Subtasks for a Task (Requires GUID)
export const fetchSubTasksByTask = async (taskGuid) => {
    const response = await axios.get(`${API_URL}/${taskGuid}/subtasks`);
    return response.data;
};

// 9. GET Task Members (Requires GUID)
export const fetchTaskMembers = async (taskGuid) => {
    const response = await axios.get(`${API_URL}/${taskGuid}/members`);
    return response.data;
};

// 10. GET Task Comments (Requires GUID)
export const fetchTaskComments = async (taskGuid) => {
    const response = await axios.get(`${API_URL}/${taskGuid}/comments`);
    return response.data;
};