import axios from "axios";

const API_URL = "http://localhost:5017/api/subtask";

// // --- ASSOCIATION WITH PARENT TASK ---
// export const fetchSubTasksByTask = async (taskGuid) => {
//     // This assumes your TaskItemController has a sub-route for subtasks
//     const response = await axios.get(`http://localhost:5017/api/taskitem/${taskGuid}/subtasks`);
//     return response.data;
// };

// --- STANDARD CRUD OPERATIONS ---

// 1. GET all subtasks
export const fetchAllSubTasks = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// 2. GET subtask by Guid ID (Matches Controller [HttpGet("{id:guid}")])
export const fetchSubTaskById = async (guidId) => {
    const response = await axios.get(`${API_URL}/${guidId}`);
    return response.data;
};

// 3. CREATE a new subtask 
// Matches Controller [HttpPost] with [FromQuery] taskId
export const createSubTask = async (taskGuid, subTaskData) => {
    // subTaskData should be { title: "string" }
    const response = await axios.post(`${API_URL}?taskId=${taskGuid}`, subTaskData);
    return response.data;
};

// 4. UPDATE a subtask (Matches Controller [HttpPut("{id:guid}")])
export const updateSubTask = async (guidId, updateData) => {
    // updateData should be { title: "string", isCompleted: boolean }
    const response = await axios.put(`${API_URL}/${guidId}`, updateData);
    return response.data;
};

// 5. DELETE a subtask (Matches Controller [HttpDelete("{id:guid}")])
export const deleteSubTask = async (guidId) => {
    const response = await axios.delete(`${API_URL}/${guidId}`);
    return response.data;
};

// --- ASSOCIATION & RELATIONSHIP METHODS ---

// 6. ASSIGN User to SubTask
// assignmentData: { userId: "guid", subTaskId: "guid" }
export const assignUserToSubTask = async (assignmentData) => {
    const response = await axios.post(`${API_URL}/AssignUser`, assignmentData);
    return response.data;
};

// 7. REMOVE User from SubTask
export const removeUserFromSubTask = async (assignmentData) => {
    const response = await axios.delete(`${API_URL}/RemoveUser`, { data: assignmentData });
    return response.data;
};

// 8. GET SubTask Members (Requires Guid)
export const fetchSubTaskMembers = async (subTaskGuid) => {
    const response = await axios.get(`${API_URL}/${subTaskGuid}/members`);
    return response.data;
};

// 9. GET SubTask Attachments (Requires Guid)
export const fetchSubTaskAttachments = async (subTaskGuid) => {
    const response = await axios.get(`${API_URL}/${subTaskGuid}/attachments`);
    return response.data;
};