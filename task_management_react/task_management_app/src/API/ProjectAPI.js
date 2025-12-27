import axios from "axios";

const API_URL = "http://localhost:5017/api/project";
const USER_API_URL = "http://localhost:5017/api/user";

export const fetchProjects = async (currentUserId, userRole) => {
    // FIX: Only attempt user-specific URL if currentUserId actually exists
    const url = (userRole === "Admin" || !currentUserId)
        ? API_URL 
        : `${USER_API_URL}/${currentUserId}/projects`;
        
    const response = await axios.get(url);
    return response.data;
};

export const fetchProjectById = async (projectIdInt) => {
    const response = await axios.get(`${API_URL}/${projectIdInt}`);
    return response.data;
};

export const addProject = async (projectData) => {
    const response = await axios.post(API_URL, projectData);
    return response.data;
};

export const editProject = async (projectIdInt, updatedProject, currentUserId, userRole) => {
    const response = await axios.put(
        `${API_URL}/${projectIdInt}?currentUserId=${currentUserId}&userRole=${userRole}`, 
        updatedProject
    );
    return response.data;
};

export const deleteProject = async (projectIdInt, currentUserId, userRole) => {
    const response = await axios.delete(
        `${API_URL}/${projectIdInt}?currentUserId=${currentUserId}&userRole=${userRole}`
    );
    return response.data;
};

export const archiveProject = async (projectIdInt, currentUserId, userRole) => {
    const response = await axios.put(
        `${API_URL}/${projectIdInt}/archive?currentUserId=${currentUserId}&userRole=${userRole}`
    );
    return response.data;
};

export const assignUserToProject = async (assignmentData) => {
    const response = await axios.post(`${API_URL}/AssignUser`, assignmentData);
    return response.data;
};

export const removeUserFromProject = async (assignmentData) => {
    const response = await axios.delete(`${API_URL}/RemoveUser`, { data: assignmentData });
    return response.data;
};

export const fetchProjectMembers = async (projectGuid) => {
    const response = await axios.get(`${API_URL}/${projectGuid}/members`);
    return response.data;
};

export const fetchProjectTasks = async (projectGuid) => {
    const response = await axios.get(`${API_URL}/${projectGuid}/tasks`);
    return response.data;
};