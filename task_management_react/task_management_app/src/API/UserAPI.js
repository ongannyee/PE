import axios from "axios";

const API_URL = "http://localhost:5017/api/user";

// --- STANDARD USER CRUD ---

// 1. ADD/REGISTER User
// Matches: [HttpPost] AddUser([FromBody] RegisterUserRequestDTO)
export const registerUser = async (userData) => {
    const response = await axios.post(API_URL, userData);
    return response.data;
};
// 1.5 LOGIN User (Add this!)
// Matches: [HttpPost("login")] (Assuming you created AuthController)
export const loginUser = async (credentials) => {
    // credentials = { email: "...", password: "..." }
    const response = await axios.post("http://localhost:5017/api/Auth/login", credentials);
    return response.data;
};

// 2. GET all users
// Matches: [HttpGet] GetAllUsers()
export const fetchAllUsers = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// 3. GET user by Integer ID
// Matches: [HttpGet("{userId:int}")] GetUserById(int userId)
export const fetchUserById = async (userIdInt) => {
    const response = await axios.get(`${API_URL}/${userIdInt}`);
    return response.data;
};

// 4. UPDATE user
// Matches: [HttpPut("{userId:int}")] UpdateUser(int userId, [FromBody] UpdateUserRequestDTO)
export const updateUser = async (userIdInt, updateData) => {
    const response = await axios.put(`${API_URL}/${userIdInt}`, updateData);
    return response.data;
};

// 5. DELETE user
// Matches: [HttpDelete("{userId:int}")] DeleteUser(int userId)
export const deleteUser = async (userIdInt) => {
    const response = await axios.delete(`${API_URL}/${userIdInt}`);
    return response.data;
};

// --- RELATIONSHIP RETRIEVAL (User Context) ---

// 6. GET all Projects a User belongs to (Requires GUID)
// Matches: [HttpGet("{userId:guid}/projects")] GetUserProjects(Guid userId)
export const fetchUserProjects = async (userGuid) => {
    const response = await axios.get(`${API_URL}/${userGuid}/projects`);
    return response.data;
};

// 7. GET all Tasks assigned to a User (Requires GUID)
// Matches: [HttpGet("{userId:guid}/tasks")] GetUserTasks(Guid userId)
export const fetchUserTasks = async (userGuid) => {
    const response = await axios.get(`${API_URL}/${userGuid}/tasks`);
    return response.data;
};

// 8. GET all Subtasks assigned to a User (Requires GUID)
// Matches: [HttpGet("{userId:guid}/subtasks")] GetUserSubTasks(Guid userId)
export const fetchUserSubTasks = async (userGuid) => {
    const response = await axios.get(`${API_URL}/${userGuid}/subtasks`);
    return response.data;
};