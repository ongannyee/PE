import axios from "axios";

const API_URL = "http://localhost:5017/api/attachment";

// 1. GET: List all attachments (Admin/Audit)
export const fetchAllAttachments = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// 2. POST: Upload File for a Task
// file: The file object from <input type="file" />
// taskId: The Guid of the task
export const uploadToTask = async (file, taskId) => {
  const formData = new FormData();
  formData.append("file", file); // Key must match 'IFormFile file' in C#

  const response = await axios.post(`${API_URL}/upload/task/${taskId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 3. POST: Upload File for a SubTask
// subTaskId: The Guid of the subtask
export const uploadToSubTask = async (file, subTaskId) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${API_URL}/upload/subtask/${subTaskId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 4. DELETE: Remove Attachment
// attachmentId: The integer ID
export const deleteAttachment = async (attachmentId) => {
  const response = await axios.delete(`${API_URL}/${attachmentId}`);
  return response.data;
};