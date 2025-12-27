import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const ProjectBarChart = ({ data }) => (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
            Member Productivity Breakdown
        </h2>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Legend iconType="circle" />
                <Bar dataKey="todo" stackId="a" fill="#94a3b8" name="To Do" />
                <Bar dataKey="inprogress" stackId="a" fill="#fbbf24" name="In Progress" />
                <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export default ProjectBarChart;