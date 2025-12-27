import React from 'react';

const DataTable = ({ title, headers, rows }) => (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="bg-slate-50 px-8 py-4 border-b border-slate-100">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-slate-100">
                        {headers.map((h, i) => (
                            <th key={i} className="px-8 py-4 font-black text-slate-900 uppercase tracking-tighter">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                            {Object.values(row).map((val, j) => (
                                <td key={j} className="px-8 py-4 text-slate-600 font-medium">{val}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default DataTable;