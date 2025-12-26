import axios from "axios";

const API_URL = "http://localhost:5017/api/project";

// GET all projects
export const fetchProjects = async () => {
  try {
    const response = await axios.get(API_URL);
    console.log("Fetched projects:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

// ADD project
export const addProject = async (project) => {
  try {
    const response = await axios.post(API_URL, project);
    return response.data;
  } catch (error) {
    console.error("Error adding project:", error);
    throw error;
  }
};

// EDIT project
export const editProject = async (projectId, updatedProject) => {
  try {
    const response = await axios.put(
      `${API_URL}/${projectId}`,
      updatedProject
    );
    return response.data;
  } catch (error) {
    console.error("Error editing project:", error);
    throw error;
  }
};

// DELETE project
export const deleteProject = async (projectId) => {
  try {
    const response = await axios.delete(`${API_URL}/${projectId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};


// ARCHIVE project
export const archiveProject = async (projectId) => {
    const response = await axios.put(`${API_URL}/${projectId}/archive`);
    return response.data;
};

// ASSIGN User to Project
export const assignUserToProject = async (assignmentData) => {
    // assignmentData should be { projectId: "guid", userId: "guid" }
    const response = await axios.post(`${API_URL}/AssignUser`, assignmentData);
    return response.data;
};

// REMOVE User from Project
export const removeUserFromProject = async (assignmentData) => {
    const response = await axios.delete(`${API_URL}/RemoveUser`, { data: assignmentData });
    return response.data;
};

// GET all Members of a Project
export const fetchProjectMembers = async (projectGuid) => {
    const response = await axios.get(`${API_URL}/${projectGuid}/members`);
    return response.data;
};

// GET all Tasks of a Project
export const fetchProjectTasks = async (projectGuid) => {
    const response = await axios.get(`${API_URL}/${projectGuid}/tasks`);
    return response.data;
};