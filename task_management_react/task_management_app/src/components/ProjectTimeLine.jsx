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
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return d >= start && d <= end;
  };

  const days = getDaysInMonth(year, month);

  // Get first day of month to determine offset
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const emptyDays = Array(firstDayOfMonth).fill(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProjects();
        // Better color palette with hex colors for reliability
        const colorPalette = [
          "#2563eb", // blue-600
          "#9333ea", // purple-600
          "#16a34a", // green-600
          "#ea580c", // orange-600
          "#db2777", // pink-600
          "#4f46e5", // indigo-600
          "#0d9488", // teal-600
          "#dc2626", // red-600
        ];
        const coloredProjects = data.map((p, i) => ({
          ...p,
          backgroundColor: colorPalette[i % colorPalette.length],
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
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-blue-600 p-4">
            Project Calendar
          </h1>
          <p className="text-gray-600">View your projects timeline</p>
        </div>

        {/* Month navigation */}
        <div className="flex justify-between items-center mb-8 bg-white rounded-xl shadow-lg p-4 max-w-2xl mx-auto">
          <button
            onClick={prevMonth}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <span className="font-bold text-2xl text-gray-800 px-6">
            {currentMonth.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            onClick={nextMonth}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
          >
            Next
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar grid */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 overflow-hidden">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {/* Day names */}
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center font-bold text-gray-700 text-sm md:text-base py-3 bg-gray-100 rounded-lg"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Empty days for alignment */}
            {emptyDays.map((_, idx) => (
              <div key={`empty-${idx}`} className="min-h-[100px]"></div>
            ))}

            {/* Days */}
            {days.map((date, idx) => {
              const dayProjects = projects.filter((p) =>
                isDateInRange(date, p.startDate, p.endDate)
              );
              const today = isToday(date);

              return (
                <div
                  key={idx}
                  className={`min-h-[100px] p-2 relative bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-lg flex flex-col ${
                    today
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Date number */}
                  <div
                    className={`text-base font-bold mb-2 flex items-center ${
                      today
                        ? "text-blue-600 bg-blue-100 w-8 h-8 rounded-full justify-center mx-auto"
                        : "text-gray-700 justify-end"
                    }`}
                  >
                    {date.getDate()}
                  </div>

                  {/* Projects container - colored circles */}
                  <div className="flex flex-wrap gap-1.5 mt-1 justify-center">
                    {dayProjects.length > 0 ? (
                      dayProjects.map((p) => (
                        <div
                          key={p.projectId}
                          className="w-3 h-3 rounded-full cursor-pointer hover:scale-125 hover:ring-2 hover:ring-gray-400 transition-all duration-150 shadow-sm"
                          style={{ backgroundColor: p.backgroundColor }}
                          title={p.projectName}
                        />
                      ))
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        {projects.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-4 max-w-4xl mx-auto">
            <h3 className="font-bold text-gray-700 mb-3 text-lg">Project Legend</h3>
            <div className="flex flex-wrap gap-3">
              {projects.slice(0, 8).map((p) => (
                <div
                  key={p.projectId}
                  className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <div 
                    className="w-4 h-4 rounded flex-shrink-0"
                    style={{ backgroundColor: p.backgroundColor }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{p.projectName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default ProjectCalendarPage;
