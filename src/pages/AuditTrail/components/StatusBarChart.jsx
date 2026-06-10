import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StatusBarChart = ({ summary }) => {
  const data = [
    { name: 'Success', count: summary.success, color: '#16a34a' },
    { name: 'Failed', count: summary.failed, color: '#dc2626' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
      <h3 className="font-semibold mb-4 text-slate-700">Event Status Comparison</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={60}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} />
            <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
            <Tooltip cursor={{fill: 'transparent'}} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatusBarChart;