import React, { useState, useEffect } from 'react';
import { fetchUserProjects, fetchProjectTasks } from '../API/UserAPI';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { fetchUserTasks } from '../API/UserAPI';

// Colors for Pie Chart Slices
const COLORS = ['#0088FE', '#FFBB28', '#00C49F']; // ToDo(Blue), InProg(Yellow), Done(Green)

const StatisticsPage = ({ currentUserId }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectTasks, setProjectTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  // 1. Load Initial Data (Projects & My Tasks)
  useEffect(() => {
    const loadData = async () => {
      if (!currentUserId) return;
      try {
        const projData = await fetchUserProjects(currentUserId);
        setProjects(projData);
        if(projData.length > 0) setSelectedProjectId(projData[0].id);

        const myTaskData = await fetchUserTasks(currentUserId);
        setMyTasks(myTaskData);
      } catch (err) {
        console.error("Error loading stats data", err);
      }
    };
    loadData();
  }, [currentUserId]);

  // 2. Load Specific Project Tasks when dropdown changes
    useEffect(() => {
    const loadProjectTasks = async () => {
        if (!selectedProjectId) return;
        try {

        const data = await fetchProjectTasks(selectedProjectId);
        
        console.log("Tasks loaded for chart:", data);
        setProjectTasks(data);
        } catch (err) {
        console.error("Error loading project tasks", err);
        }
    };
    loadProjectTasks();
    }, [selectedProjectId]);

  // --- ANALYTICS HELPERS ---

  // Helper 1: Calculate Status Counts for Pie Charts
  const getStatusCounts = (taskList) => {
    let todo = 0, inprog = 0, done = 0;
    taskList.forEach(t => {
      const s = String(t.status).toLowerCase();
      if (s === 'done' || s === 'completed' || s === '2') done++;
      else if (s === 'inprogress' || s === '1') inprog++;
      else todo++;
    });
    return [
      { name: 'To Do', value: todo },
      { name: 'In Progress', value: inprog },
      { name: 'Done', value: done }
    ];
  };

  // Helper 2: Calculate Burn-up Data (Line Chart)
  // Groups completed tasks by date
  const getBurnUpData = (taskList) => {
    // Filter only done tasks with a CompletedAt date
    const doneTasks = taskList
      .filter(t => (String(t.status).toLowerCase() === 'done' || t.status === '2') && t.completedAt)
      .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

    const dataMap = {};
    let cumulative = 0;

    doneTasks.forEach(t => {
      const dateStr = new Date(t.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      cumulative++; // Increment cumulative count
      dataMap[dateStr] = cumulative;
    });

    // Convert map to array for Recharts
    return Object.keys(dataMap).map(date => ({
      date,
      completed: dataMap[date]
    }));
  };

  const myStatusData = getStatusCounts(myTasks);
  const projectStatusData = getStatusCounts(projectTasks);
  const burnUpData = getBurnUpData(projectTasks);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>

      {/* ROW 1: Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Chart 3: My Tasks Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-bold mb-4 text-center">My Performance</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={myStatusData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                            {myStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Chart 2 & 4: Project Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Project Overview</h3>
                <select 
                    className="border p-1 rounded text-sm"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.projectName}</option>
                    ))}
                </select>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={projectStatusData} cx="50%" cy="50%" outerRadius={80} fill="#82ca9d" dataKey="value" label>
                            {projectStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* ROW 2: Line Chart (Chart 1) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-bold mb-4">Project Progress (Tasks Completed Over Time)</h3>
        {burnUpData.length > 0 ? (
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={burnUpData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="completed" stroke="#8884d8" activeDot={{ r: 8 }} name="Total Completed" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 italic">
                No completed tasks data available for this project yet.
            </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;