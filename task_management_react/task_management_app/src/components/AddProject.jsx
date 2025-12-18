import { useState } from "react";
import { addProject } from "../API/ProjectAPI";

function AddProject() {
  const [form, setForm] = useState({
    projectId: "",
    title: "",
    author: "",
    genre: "",
    price: "",
    publishedDate: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addProject({
        ...form,
        price: parseFloat(form.price),
      });
      setMessage("Project added successfully!");
      setForm({
        projectId: "",
        title: "",
        author: "",
        genre: "",
        price: "",
        publishedDate: "",
      });
    } catch (error) {
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
          <label className="block mb-1">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Author</label>
          <input
            name="author"
            value={form.author}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Genre</label>
          <input
            name="genre"
            value={form.genre}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Price</label>
          <input
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1">Published Date</label>
          <input
            name="publishedDate"
            type="date"
            value={form.publishedDate}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Add Project
        </button>
        {message && (
          <div className="mt-4 text-center text-green-600">{message}</div>
        )}
      </form>
    </div>
  );
}

export default AddProject;
