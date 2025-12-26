import axios from "axios";

const API_URL = "http://localhost:5017/api/subtask";

export const fetchSubTasksByTask = async (taskGuid) => {
    const response = await axios.get(`http://localhost:5017/api/taskitem/${taskGuid}/subtasks`);
    return response.data;
};

// --- STANDARD CRUD OPERATIONS ---

// 1. GET all subtasks
export const fetchAllSubTasks = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// 2. GET subtask by Integer ID (Matches {subTaskId:int})
export const fetchSubTaskById = async (subTaskIdInt) => {
    const response = await axios.get(`${API_URL}/${subTaskIdInt}`);
    return response.data;
};

// 3. CREATE a new subtask 
// Matches: [FromBody] SubTaskDTO dto AND [FromQuery] Guid taskId
export const createSubTask = async (taskGuid, subTaskData) => {
    // subTaskData should be { title: "Read Documentation" }
    const response = await axios.post(`${API_URL}?taskId=${taskGuid}`, subTaskData);
    return response.data;
};

// 4. UPDATE a subtask (Rename or Toggle Completion)
export const updateSubTask = async (subTaskIdInt, updateData) => {
    // updateData: { title: "string", isCompleted: boolean }
    const response = await axios.put(`${API_URL}/${subTaskIdInt}`, updateData);
    return response.data;
};

// 5. DELETE a subtask
export const deleteSubTask = async (subTaskIdInt) => {
    const response = await axios.delete(`${API_URL}/${subTaskIdInt}`);
    return response.data;
};

// --- ASSOCIATION & RELATIONSHIP METHODS ---

// 6. ASSIGN User to SubTask (Requires GUIDs in assignmentData)
export const assignUserToSubTask = async (assignmentData) => {
    const response = await axios.post(`${API_URL}/AssignUser`, assignmentData);
    return response.data;
};

// 7. REMOVE User from SubTask
export const removeUserFromSubTask = async (assignmentData) => {
    const response = await axios.delete(`${API_URL}/RemoveUser`, { data: assignmentData });
    return response.data;
};

// 8. GET SubTask Members (Requires GUID)
export const fetchSubTaskMembers = async (subTaskGuid) => {
    const response = await axios.get(`${API_URL}/${subTaskGuid}/members`);
    return response.data;
};

// 9. GET SubTask Attachments (Requires GUID)
export const fetchSubTaskAttachments = async (subTaskGuid) => {
    const response = await axios.get(`${API_URL}/${subTaskGuid}/attachments`);
    return response.data;
};