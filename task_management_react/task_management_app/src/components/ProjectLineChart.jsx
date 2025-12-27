import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const ProjectLineChart = ({ data }) => (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
            Project Velocity (%)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickFormatter={(val) => `${val}%`} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="expected" stroke="#cbd5e1" strokeDasharray="5 5" name="Target" dot={false} />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} name="Actual" dot={{ r: 4 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

export default ProjectLineChart;