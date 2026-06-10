import React from 'react';
import { Loader2 } from 'lucide-react';

const AuditTable = ({ logs, loading, page, setPage, totalPages }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-700">Audit Trail Logs</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">Actor / Org</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Resource ID</th>
              <th className="px-6 py-3">Latency</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  <p className="text-slate-500 mt-2">Memuat data log...</p>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-12 text-slate-500">
                  Tidak ada data log pada halaman ini.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(log.event_time).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {log.actor_org_id || log.actor_user_id || 'System'}
                  </td>
                  <td className="px-6 py-4">{log.action}</td>
                  <td className="px-6 py-4 text-slate-500">{log.resource_id}</td>
                  <td className="px-6 py-4">{log.latency_ms} ms</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                      log.result === 'SUCCESS' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 0 && (
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-600">
            Halaman <span className="font-semibold text-slate-900">{page}</span> dari {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border border-slate-200 rounded-md text-sm font-medium text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border border-slate-200 rounded-md text-sm font-medium text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTable;