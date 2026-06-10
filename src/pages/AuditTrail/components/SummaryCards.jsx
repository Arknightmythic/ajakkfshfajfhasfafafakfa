import React from 'react';

const SummaryCards = ({ summary, retention }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
        <h3 className="text-slate-500 text-sm font-medium">Successful Events</h3>
        <p className="text-3xl font-bold text-green-600 mt-2">{summary.success}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
        <h3 className="text-slate-500 text-sm font-medium">Failed Events</h3>
        <p className="text-3xl font-bold text-red-600 mt-2">{summary.failed}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
        <h3 className="text-slate-500 text-sm font-medium">Retention Executions</h3>
        <p className="text-3xl font-bold text-blue-600 mt-2">{retention.total_executions}</p>
        <p className="text-xs text-slate-400 mt-1">Last run: {retention.last_execution}</p>
      </div>
    </div>
  );
};

export default SummaryCards;