import React from 'react';

function ProjectSearchBar({ search, setSearch, onSearch, onReset }) {
  return (
    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-full max-w-2xl mb-8">
      {/* Search Icon */}
      <div className="pl-3 text-slate-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Input Field */}
      <input
        type="text"
        placeholder="Search projects by name or keywords..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch();
        }}
        className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 text-sm font-medium py-2"
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {search && (
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            Reset
          </button>
        )}
        <button
          onClick={onSearch}
          className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md active:scale-95"
        >
          Search
        </button>
      </div>
    </div>
  );
}

export default ProjectSearchBar;