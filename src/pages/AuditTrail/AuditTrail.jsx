import React, { useState } from "react";
import { Loader2, Calendar, RefreshCcw } from "lucide-react";
import SummaryCards from "./components/SummaryCards";
import LatencyLineChart from "./components/LatencyLineChart";
import StatusBarChart from "./components/StatusBarChart";
import AuditTable from "./components/AuditTable";
import AccessTable from "./components/AccessTable"; // Import komponen baru
import useAuditSummary from "./hooks/useAuditSummary";
import useAuditLogs from "./hooks/useAuditLogs";
import useAccessLogs from "./hooks/useAccessLogs"; // Import hook baru

const AuditTrail = () => {
  const [period, setPeriod] = useState("daily");
  const [refreshInterval, setRefreshInterval] = useState(0);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // State untuk kontrol Tab Tabel mana yang sedang dilihat
  const [activeTableTab, setActiveTableTab] = useState("audit"); // 'audit' atau 'access'

  const {
    summary,
    latencyData,
    retention,
    loading: summaryLoading,
  } = useAuditSummary(period, dateRange, refreshInterval);

  // Fetch logs untuk masing-masing tabel
  const audit = useAuditLogs(period, dateRange, refreshInterval, 1, activeTableTab === "audit");
  const access = useAccessLogs(period, dateRange, refreshInterval, 1, activeTableTab === "access");

  const TABS = [
    { id: "daily", label: "Today" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "custom", label: "Custom Date" },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER & TOP CONTROL PANEL (Tetap Sama Seperti Sebelumnya) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Audit & Access Events
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time monitoring for backend processes and data access.
          </p>
        </div>
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 h-10 shadow-sm">
            <RefreshCcw
              className={`w-4 h-4 mr-2 ${refreshInterval > 0 ? "text-blue-500 animate-spin-slow" : "text-slate-400"}`}
            />
            <select
              className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            >
              <option value={0}>Manual / Off</option>
              <option value={5000}>Auto: 5s</option>
              <option value={15000}>Auto: 15s</option>
              <option value={60000}>Auto: 1m</option>
            </select>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${period === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {period === "custom" && (
          <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            {/* Kalender tetap seperti kode sebelumnya */}
            <div className="flex items-center flex-1 max-w-xs relative">
              <Calendar className="w-5 h-5 text-slate-400 absolute left-3" />
              <input
                type="date"
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
              />
            </div>
            <span className="text-slate-400 text-sm font-medium">to</span>
            <div className="flex items-center flex-1 max-w-xs relative">
              <Calendar className="w-5 h-5 text-slate-400 absolute left-3" />
              <input
                type="date"
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
                value={dateRange.end}
                min={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
              />
            </div>
          </div>
        )}
        </div>
        
      </div>

      {/* SUMMARY & CHARTS */}
      {summaryLoading ? (
        <div className="flex justify-center items-center h-48 bg-white rounded-lg border border-slate-100">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <SummaryCards summary={summary} retention={retention} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LatencyLineChart data={latencyData} />
            <StatusBarChart summary={summary} />
          </div>
        </>
      )}

      {/* TWO TABLES SECTION (Dengan Tab Switcher) */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden mt-6">
        {/* Tab Pemilih Tabel */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-2 pt-2">
          <button
            onClick={() => setActiveTableTab("audit")}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTableTab === "audit" ? "border-blue-600 text-blue-600 bg-white rounded-t-lg" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            System Audit Events
          </button>
          <button
            onClick={() => setActiveTableTab("access")}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTableTab === "access" ? "border-blue-600 text-blue-600 bg-white rounded-t-lg" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            Access / View Events
          </button>
        </div>

        {/* Render Tabel Sesuai Pilihan */}
        <div className="p-0">
          {activeTableTab === "audit" ? (
            <AuditTable
              logs={audit.logs}
              loading={audit.loading && audit.logs.length === 0}
              page={audit.page}
              setPage={audit.setPage}
              totalPages={audit.totalPages}
            />
          ) : (
            <AccessTable
              logs={access.logs}
              loading={access.loading && access.logs.length === 0}
              page={access.page}
              setPage={access.setPage}
              totalPages={access.totalPages}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;