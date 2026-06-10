import React from 'react';
import { Loader2 } from 'lucide-react';

const AccessTable = ({ logs, loading, page, setPage, totalPages }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-3">Timestamp</th>
            <th className="px-6 py-3">User / Actor</th>
            <th className="px-6 py-3">Action</th>
            <th className="px-6 py-3">IP Address</th>
            <th className="px-6 py-3">Latency</th>
            <th className="px-6 py-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="text-center py-12">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
              </td>
            </tr>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-12 text-slate-500">Tidak ada data akses log.</td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">{new Date(log.event_time).toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{log.actor || 'Anonymous'}</td>
                <td className="px-6 py-4 text-slate-600">{log.action}</td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{log.ip_address}</td>
                <td className="px-6 py-4 text-slate-600">{log.latency_ms} ms</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${log.result === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {log.result}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {!loading && totalPages > 0 && (
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-600">Halaman <span className="font-semibold">{page}</span> dari {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border border-slate-200 rounded-md text-sm hover:bg-slate-50 disabled:opacity-50">Prev</button>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border border-slate-200 rounded-md text-sm hover:bg-slate-50 disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessTable;