import axios from "axios";

const API_URL = "http://localhost:5017/api/project";

// 1. GET all projects
export const fetchProjects = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// 2. GET project by ID (Expects INTEGER ProjectId)
export const fetchProjectById = async (projectIdInt) => {
    const response = await axios.get(`${API_URL}/${projectIdInt}`);
    return response.data;
};

// 3. ADD project
export const addProject = async (projectData) => {
    const response = await axios.post(API_URL, projectData);
    return response.data;
};

// 4. EDIT project (Expects INTEGER ProjectId)
export const editProject = async (projectIdInt, updatedProject) => {
    const response = await axios.put(`${API_URL}/${projectIdInt}`, updatedProject);
    return response.data;
};

// 5. DELETE project (Expects INTEGER ProjectId)
export const deleteProject = async (projectIdInt) => {
    const response = await axios.delete(`${API_URL}/${projectIdInt}`);
    return response.data;
};

// 6. ARCHIVE project (Expects INTEGER ProjectId)
export const archiveProject = async (projectIdInt) => {
    const response = await axios.put(`${API_URL}/${projectIdInt}/archive`);
    return response.data;
};

// --- ASSOCIATION & RELATIONSHIP METHODS ---

// 7. ASSIGN User to Project (Expects GUIDs for both)
// assignmentData: { projectId: "guid", userId: "guid" }
export const assignUserToProject = async (assignmentData) => {
    const response = await axios.post(`${API_URL}/AssignUser`, assignmentData);
    return response.data;
};

// 8. REMOVE User from Project (Expects GUIDs for both)
export const removeUserFromProject = async (assignmentData) => {
    const response = await axios.delete(`${API_URL}/RemoveUser`, { data: assignmentData });
    return response.data;
};

// 9. GET all Members of a Project (Expects GUID projectId)
export const fetchProjectMembers = async (projectGuid) => {
    const response = await axios.get(`${API_URL}/${projectGuid}/members`);
    return response.data;
};

// 10. GET all Tasks of a Project (Expects GUID projectId)
export const fetchProjectTasks = async (projectGuid) => {
    const response = await axios.get(`${API_URL}/${projectGuid}/tasks`);
    return response.data;
};