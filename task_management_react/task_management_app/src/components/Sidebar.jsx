function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { id: "projects", label: "Project List" },
    { id: "add-project", label: "Add Project" },
    { id: "project-timeline",label: "Timeline"},
  ];

  return (
    <aside className="w-64 bg-white border-r shadow-md">
      <div className="p-6 text-xl font-bold border-b">Menu</div>
      <ul>
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={`p-4 cursor-pointer hover:bg-blue-100 ${
              activePage === item.id ? "bg-blue-200 font-semibold" : ""
            }`}
            onClick={() => setActivePage(item.id)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
