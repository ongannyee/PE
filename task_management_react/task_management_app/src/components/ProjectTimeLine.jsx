import { useEffect, useState } from "react";
import { fetchProjects } from "../API/ProjectAPI";

function ProjectCalendarPage() {
  const [projects, setProjects] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const month = currentMonth.getMonth();
  const year = currentMonth.getFullYear();

  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const isDateInRange = (date, startDate, endDate) => {
    const d = new Date(date.setHours(0, 0, 0, 0));
    const start = new Date(startDate.setHours(0, 0, 0, 0));
    const end = new Date(endDate.setHours(0, 0, 0, 0));
    return d >= start && d <= end;
  };

  const days = getDaysInMonth(year, month);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProjects();
        const coloredProjects = data.map((p, i) => ({
          ...p,
          color: `hsl(${(i * 70) % 360}, 70%, 70%)`,
          startDate: new Date(p.startDate),
          endDate: new Date(p.endDate),
        }));
        setProjects(coloredProjects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };
    fetchData();
  }, []);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8">Project Calendar</h1>

      {/* Month navigation */}
      <div className="flex justify-between mb-6 max-w-lg mx-auto">
        <button
          onClick={prevMonth}
          className="px-6 py-3 bg-gray-300 rounded hover:bg-gray-400 text-lg"
        >
          Prev
        </button>
        <span className="font-semibold text-xl">
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          onClick={nextMonth}
          className="px-6 py-3 bg-gray-300 rounded hover:bg-gray-400 text-lg"
        >
          Next
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 max-w-7xl mx-auto">
        {/* Day names */}
        {dayNames.map((day) => (
          <div key={day} className="text-center font-semibold text-lg">
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((date, idx) => {
          const dayProjects = projects.filter((p) =>
            isDateInRange(date, p.startDate, p.endDate)
          );

          return (
            <div
              key={idx}
              className="border h-32 p-2 relative bg-white rounded shadow"
            >
              <div className="text-right text-lg font-semibold">{date.getDate()}</div>
              <div className="flex flex-col gap-1 mt-2">
                {dayProjects.map((p) => (
                  <div
                    key={p.projectId}
                    className="text-sm text-white px-2 py-1 rounded truncate"
                    style={{ backgroundColor: p.color }}
                    title={p.projectName}
                  >
                    {p.projectName}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProjectCalendarPage;
