import axios from "axios";

const API_URL = "http://localhost:5017/api/attachment";

// 1. GET: List all attachments (For Admin/Audit)
export const fetchAllAttachments = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// 2. POST: Upload File for a Task
// Matches: [HttpPost("upload/task/{taskId:guid}")]
export const uploadToTask = async (file, taskIdGuid) => {
  const formData = new FormData();
  formData.append("file", file); // Must match 'IFormFile file' in C#

  const response = await axios.post(`${API_URL}/upload/task/${taskIdGuid}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 3. POST: Upload File for a SubTask
// Matches: [HttpPost("upload/subtask/{subTaskId:guid}")]
export const uploadToSubTask = async (file, subTaskIdGuid) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${API_URL}/upload/subtask/${subTaskIdGuid}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 4. DELETE: Remove Attachment and physical file
// Matches: [HttpDelete("{attachmentId:int}")]
export const deleteAttachment = async (attachmentIdInt) => {
  const response = await axios.delete(`${API_URL}/${attachmentIdInt}`);
  return response.data;
};