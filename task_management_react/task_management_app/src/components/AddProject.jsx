import { useState } from "react";
import axios from "axios";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5017/api/project", {
        ...form,
        projectId: parseInt(form.projectId),
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
    } catch (error) {
      console.error(error);
      setMessage("Failed to add project.");
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
              value={form.projectId}
              onChange={handleChange}
              required
              className="w-full border px-4 py-3 rounded"
            />
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
              className="w-full border px-4 py-3 rounded"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">End Date</label>
            <input
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {/* Archived Name */}
          <div>
            <label className="block mb-2 font-medium">Archived Name</label>
            <input
              name="archivedName"
              value={form.archivedName}
              onChange={handleChange}
              required
              className="w-full border px-4 py-3 rounded"
            />
        </div></div>
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
