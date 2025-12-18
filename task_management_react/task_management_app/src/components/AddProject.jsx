import { useState } from "react";
import axios from "axios";

function AddProject() {
  const [form, setForm] = useState({
    projectId: "",
    projectName: "",
    projectGoal: "",
    startDate: "",
    endDate: "",
    isArchived: false,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5017/api/project", {
        ...form,
        projectId: parseInt(form.projectId), // convert to integer
      });
      setMessage("Project added successfully!");
      setForm({
        projectId: "",
        projectName: "",
        projectGoal: "",
        startDate: "",
        endDate: "",
        isArchived: false,
      });
    } catch (error) {
      console.error(error);
      setMessage("Failed to add project.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">
          Add New Project
        </h2>

        <div className="mb-4">
          <label className="block mb-1">Project ID</label>
          <input
            name="projectId"
            type="number"
            value={form.projectId}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Project Name</label>
          <input
            name="projectName"
            value={form.projectName}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Project Goal</label>
          <input
            name="projectGoal"
            value={form.projectGoal}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Start Date</label>
          <input
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">End Date</label>
          <input
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-6 flex items-center">
          <input
            name="isArchived"
            type="checkbox"
            checked={form.isArchived}
            onChange={handleChange}
            className="mr-2"
          />
          <label>Is Archived?</label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Add Project
        </button>

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
