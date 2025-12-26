import axios from "axios";

const API_URL = "http://localhost:5017/api/comment";

// 1. GET: All comments (Global list)
export const fetchAllComments = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// 2. GET: Comments for a specific task
// Matches [HttpGet("task/{taskId:guid}")]
export const fetchTaskComments = async (taskGuid) => {
    const response = await axios.get(`${API_URL}/task/${taskGuid}`);
    return response.data;
};

// 3. POST: Add a new comment
// commentData: { text: "string", TaskId: "guid", userId: "guid" }
export const addComment = async (commentData) => {
    const response = await axios.post(API_URL, commentData);
    return response.data;
};

// 4. PUT: Update an existing comment
// Note: The controller expects [FromBody] string text (raw string, not an object)
export const updateComment = async (commentIdInt, text) => {
    const response = await axios.put(`${API_URL}/${commentIdInt}`, `"${text}"`, {
        headers: { "Content-Type": "application/json" }
    });
    return response.data;
};

// 5. DELETE: Remove a comment
export const deleteComment = async (commentIdInt) => {
    const response = await axios.delete(`${API_URL}/${commentIdInt}`);
    return response.data;
};