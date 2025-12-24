import { useState, useEffect } from "react";
import { fetchProjects, addProject } from "../API/ProjectAPI";

function AddProject() {
  const [form, setForm] = useState({
    projectId: "",
    projectName: "",
    projectGoal: "",
    startDate: "",
    endDate: "",
    archivedName: "",
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [existingProjects, setExistingProjects] = useState([]);

  // Fetch existing projects on mount to check for duplicates
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await fetchProjects();
        setExistingProjects(projects);
      } catch (error) {
        console.error("Error loading projects:", error);
      }
    };
    loadProjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate Project ID to only accept integers
    if (name === "projectId") {
      // Allow empty string or valid integer (only digits)
      if (value === "" || /^\d+$/.test(value)) {
        setForm({ ...form, [name]: value });
        // Clear error when user starts typing valid input
        if (errors.projectId) {
          setErrors({ ...errors, projectId: "" });
        }
      }
    } else {
      setForm({ ...form, [name]: value });
      // Clear date errors when dates change
      if (name === "startDate" || name === "endDate") {
        if (errors.dateValidation) {
          setErrors({ ...errors, dateValidation: "" });
        }
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate Project ID is an integer
    if (!form.projectId || form.projectId.trim() === "") {
      newErrors.projectId = "Project ID is required";
    } else if (!/^\d+$/.test(form.projectId)) {
      newErrors.projectId = "Project ID must be an integer";
    } else {
      const projectIdNum = parseInt(form.projectId);
      // Check for duplicate ID
      const duplicate = existingProjects.find(
        (p) => p.projectId === projectIdNum
      );
      if (duplicate) {
        newErrors.projectId = `Project ID ${projectIdNum} already exists`;
      }
    }

    // Validate dates
    if (form.startDate && form.endDate) {
      const startDate = new Date(form.startDate);
      const endDate = new Date(form.endDate);
      if (endDate < startDate) {
        newErrors.dateValidation = "End date cannot be earlier than start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validate form
    if (!validateForm()) {
      setMessage("Please fix the errors before submitting.");
      return;
    }

    try {
      await addProject({
        ...form,
        projectId: parseInt(form.projectId),
        isArchived: false,
      });
      setMessage("Project added successfully!");
      setForm({
        projectId: "",
        projectName: "",
        projectGoal: "",
        startDate: "",
        endDate: "",
        archivedName: "",
      });
      setErrors({});
      
      // Refresh existing projects list
      const projects = await fetchProjects();
      setExistingProjects(projects);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 400 || error.response?.status === 409) {
        setMessage(error.response?.data?.message || "Failed to add project. Project ID may already exist.");
      } else {
        setMessage("Failed to add project. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded shadow-md w-full max-w-4xl"
      >
        <h2 className="text-3xl font-bold mb-8 text-blue-700 text-center">
          Add New Project
        </h2>

        <div className="grid grid-cols-2 gap-6">
          {/* Project ID */}
          <div>
            <label className="block mb-2 font-medium">Project ID</label>
            <input
              name="projectId"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.projectId}
              onChange={handleChange}
              required
              className={`w-full border px-4 py-3 rounded ${
                errors.projectId ? "border-red-500" : ""
              }`}
            />
            {errors.projectId && (
              <p className="text-red-500 text-sm mt-1">{errors.projectId}</p>
            )}
          </div>
          
          {/* Project Name */}
          <div>
            <label className="block mb-2 font-medium">Project Name</label>
            <input
              name="projectName"
              value={form.projectName}
              onChange={handleChange}
              required
              className="w-full border px-4 py-3 rounded"
            />
          </div>
        </div>

        {/* Project Goal (textarea, bigger) */}
        <div className="mt-6">
          <label className="block mb-2 font-medium">Project Goal</label>
          <textarea
            name="projectGoal"
            value={form.projectGoal}
            onChange={handleChange}
            required
            rows={6}
            className="w-full border px-4 py-3 rounded resize-none"
            placeholder="Describe the project goals..."
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block mb-2 font-medium">Start Date</label>
            <input
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              required
              className={`w-full border px-4 py-3 rounded ${
                errors.dateValidation ? "border-red-500" : ""
              }`}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">End Date</label>
            <input
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              min={form.startDate || undefined}
              className={`w-full border px-4 py-3 rounded ${
                errors.dateValidation ? "border-red-500" : ""
              }`}
            />
            {errors.dateValidation && (
              <p className="text-red-500 text-sm mt-1">{errors.dateValidation}</p>
            )}
          </div>
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded mt-8 hover:bg-blue-700 transition text-lg font-medium"
        >
          Add Project
        </button>

        {/* Message */}
        {message && (
          <div
            className={`mt-4 text-center ${
              message.includes("Failed") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default AddProject;
