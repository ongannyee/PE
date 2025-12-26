import axios from "axios";

const BASE_URL = "http://localhost:5017";
const API_URL = `${BASE_URL}/api/attachment`;

/**
 * 1. GET: List all attachments
 */
export const fetchAllAttachments = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching all attachments:", error);
    throw error;
  }
};

/**
 * 2. POST: Upload File for a Task
 */
export const uploadToTask = async (file, taskIdGuid) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${API_URL}/upload/task/${taskIdGuid}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Task Upload Error:", error);
    throw error;
  }
};

/**
 * 3. POST: Upload File for a SubTask
 */
export const uploadToSubTask = async (file, subTaskIdGuid) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${API_URL}/upload/subtask/${subTaskIdGuid}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("SubTask Upload Error:", error);
    throw error;
  }
};

/**
 * 4. DELETE: Remove Attachment using Guid ID
 * Matches updated Controller [HttpDelete("{id:guid}")]
 */
export const deleteAttachment = async (attachmentGuid) => {
  try {
    // Ensure we are passing the GUID 'id' from the object
    const response = await axios.delete(`${API_URL}/${attachmentGuid}`);
    return response.data;
  } catch (error) {
    console.error("Delete Attachment Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * HELPER: Construct full URL for display
 */
export const getFullFileUrl = (relativeUrl) => {
  if (!relativeUrl) return "";
  return `${BASE_URL}${relativeUrl}`;
};