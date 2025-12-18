import { useState, useEffect } from "react";

function UpdateProjectModal({ project, onClose, onUpdate }) {
  const [form, setForm] = useState({ ...project });
  const [visible, setVisible] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState(project.members || []);

  const allUsers = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
    { id: 4, name: "David" },
  ];

  useEffect(() => {
    setVisible(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleMemberChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(parseInt(options[i].value));
    }
    setSelectedMembers(selected);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(project.projectId, { ...form, members: selectedMembers });
    handleClose();
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(), 200);
  };

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center z-50 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={`bg-white p-8 rounded shadow-lg w-full max-w-2xl mx-4 transform transition-transform duration-200 ${
          visible ? "translate-y-0" : "-translate-y-4"
        }`}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Update Project: {project.projectName}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div>
            <label className="block mb-1 font-medium">Project Name</label>
            <input
              name="projectName"
              value={form.projectName}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          {/* Project Goal */}
          <div>
            <label className="block mb-1 font-medium">Project Goal</label>
            <textarea
              name="projectGoal"
              value={form.projectGoal}
              onChange={handleChange}
              rows={6}
              className="w-full border px-3 py-2 rounded resize-none"
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate?.split("T")[0]}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate?.split("T")[0]}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* Assign Members */}
          <div>
            <label className="block mb-1 font-medium">Assign Members</label>
            <select
              multiple
              value={selectedMembers}
              onChange={handleMemberChange}
              className="w-full border px-3 py-2 rounded h-32"
            >
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border rounded hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProjectModal;
