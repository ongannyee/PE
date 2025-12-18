import axios from "axios";

const API_URL = "";

export const fetchProjects = async () => {
    try {
        const response = await axios.get(API_URL);
        console.log(resposne.data);
        return response.data;

    }catch(error){
        console.error("Error fetching projects :",error);
        throw error;
    }
};
export const addProject = async (project) => {
    try {
        const response = await axios.post(API_URL,project);
        return response.data;

    }catch(error){
        console.error("Error adding projects :",error);
        throw error;
    }
};
export const editProject = async (projectId,updatedProject) => {
    try {
        const response = await axios.put(`${API_URL}/${projectId}`,updatedProject);
        return response.data;

    }catch(error){
        console.error("Error editing projects :",error);
        throw error;
    }
};
export const deletetProject = async (projectId) => {
    try {
        const response = await axios.delete(`${API_URL}/${projectId}`);
        return response.data;

    }catch(error){
        console.error("Error deleting projects :",error);
        throw error;
    }
};