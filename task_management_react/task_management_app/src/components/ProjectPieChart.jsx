import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const COLORS = ['#10b981', '#fbbf24', '#94a3b8']; // Completed, In Progress, To Do

const ProjectPieChart = ({ data }) => (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
            Task Status Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie 
                    data={data} 
                    innerRadius={70} 
                    outerRadius={90} 
                    paddingAngle={5} 
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
        </ResponsiveContainer>
    </div>
);

export default ProjectPieChart;