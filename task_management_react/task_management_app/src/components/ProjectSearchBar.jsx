function ProjectSearchBar({ search, setSearch, onSearch, onReset }) {
  return (
    <div className="flex justify-start mb-6 gap-2">
      <input
        type="text"
        placeholder="Search by Name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch();
        }}
        className="border border-gray-300 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        onClick={onSearch}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Search
      </button>
      <button
        onClick={onReset}
        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
      >
        Reset
      </button>
    </div>
  );
}

export default ProjectSearchBar;
