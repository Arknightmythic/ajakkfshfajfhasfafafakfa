import { useState, useEffect } from "react";
import { Loader2, Search, Terminal, X, CheckCircle2, XCircle } from "lucide-react"; 
import useGetData from "../BatchSynchronization/hooks/useGetData";
import { listenToSyncStream } from "../UploadAndGrading/hooks/useSync";
import { useNavigate } from "react-router-dom";

const BatchSynchronization = () => {
  // --- STATE UNTUK FILTER DAN PAGINATION ---
  const [searchInput, setSearchInput] = useState(""); // Menampung teks yang sedang diketik
  const [searchTerm, setSearchTerm] = useState(""); // Menampung teks yang sudah di-submit untuk pencarian
  const [gradeFilter, setGradeFilter] = useState("1,2,3,4,5");
  const [statusFilter, setStatusFilter] = useState("1,2,3");
  const [page, setPage] = useState(1);

  const [selectedLogId, setSelectedLogId] = useState(null);
  const [matchingLogs, setMatchingLogs] = useState({});

  const currentPageLayout = "list"; // Diganti nama agar tidak rancu dengan 'page' pagination
  const navigate = useNavigate();

  // --- FETCH DATA DENGAN QUERY BARU ---
  const {
    data: responseData,
    isLoading: loading,
    error,
  } = useGetData({
    page,
    institution_name: searchTerm, // Tetap gunakan searchTerm di sini
    grade: gradeFilter,
    sync_status: statusFilter,
  });

  // Ekstrak data dan metadata pagination dari response
  const dataList = responseData?.data || [];
  const totalRows = responseData?.total_rows || 0;
  const totalPages = responseData?.total_pages || 1;
  const hasNext = responseData?.has_next || false;
  const hasPrev = responseData?.has_prev || false;

  const gradeColor = {
    A: "bg-green-200 text-green-800",
    B: "bg-yellow-200 text-yellow-800",
    C: "bg-orange-200 text-orange-800",
    D: "bg-purple-200 text-purple-800",
    E: "bg-red-200 text-red-800",
  };

  const statusColor = {
    "awaiting action": "bg-red-100 text-red-800",
    "in progress": "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
  };

  const showInvestigationPage = (id, name, grade) => {
    navigate("/batch-synchronization/investigate", {
      state: {
        metadata_id: id,
        institutionName: name,
        statusGrade: grade,
      },
    });
  };

  const showMatchedPage = (id, name, grade) => {
    navigate("/batch-synchronization/preview", {
      state: {
        metadata_id: id,
        institutionName: name,
        statusGrade: grade,
      },
    });
  };

  const toTitleCase = (text) =>
    text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // ── EFFECT: Hubungkan Stream Log Saat Tombol Terminal Diklik ──
  useEffect(() => {
    if (!selectedLogId) return;

    let isMounted = true;

    // Kosongkan array log agar bersih saat modal dibuka
    setMatchingLogs((prev) => ({
      ...prev,
      [selectedLogId]: {
        logs: [],
        isDone: false,
        isFailed: false,
      },
    }));

    const onLog = (payload) => {
      if (!isMounted) return;
      setMatchingLogs((prev) => {
        const existingLogs = prev[selectedLogId]?.logs || [];
        return {
          ...prev,
          [selectedLogId]: {
            ...prev[selectedLogId],
            logs: [...existingLogs, payload],
          },
        };
      });
    };

    // Panggil stream listener
    listenToSyncStream(selectedLogId, onLog)
      .then((result) => {
        if (!isMounted) return;
        if (result && result.matching_task_status === "SUCCESS") {
          setMatchingLogs((prev) => ({
            ...prev,
            [selectedLogId]: {
              ...prev[selectedLogId],
              isDone: true,
              isFailed: false,
            },
          }));
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Gagal Stream AI:", err);
        setMatchingLogs((prev) => ({
          ...prev,
          [selectedLogId]: {
            ...(prev[selectedLogId] || { logs: [] }),
            isDone: false,
            isFailed: true,
          },
        }));
      });

    return () => {
      isMounted = false;
    };
  }, [selectedLogId]);

  if (loading && dataList.length === 0) {
    // Hanya tampilkan loader jika data awal kosong (biar background refetch tidak kedip)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }



  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Page</h3>
          <p className="text-red-600 mt-1">
            {error.message || "Unknown error occurred."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {currentPageLayout === "list" && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="flex-grow w-full sm:w-auto">
              <div className="flex items-center border border-slate-300 rounded-md overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-white transition-all w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search by Ministry/Institution..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearchTerm(searchInput);
                      setPage(1);
                    }
                  }}
                  // Border dihilangkan (outline-none, border-none) agar menyatu dengan div pembungkus
                  className="w-full pl-4 pr-2 py-2 text-sm focus:outline-none bg-transparent border-none"
                />

                <button
                  onClick={() => {
                    setSearchTerm(searchInput);
                    setPage(1);
                  }}
                  // Tombol search menyatu di sebelah kanan dalam div pembungkus
                  className="px-3 py-2.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors focus:outline-none flex items-center justify-center cursor-pointer border-l border-transparent"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            <select
              value={gradeFilter}
              onChange={(e) => {
                setGradeFilter(e.target.value);
                setPage(1); // Reset page jika filter berubah
              }}
              className="w-full sm:w-auto px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="1,2,3,4,5">All Grade</option>
              <option value="1">Grade A</option>
              <option value="2">Grade B</option>
              <option value="3">Grade C</option>
              <option value="4">Grade D</option>
              <option value="5">Grade E</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1); // Reset page jika filter berubah
              }}
              className="w-full sm:w-auto px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="1,2,3">All Status</option>
              <option value="1">In Progress</option>
              <option value="2">Awaiting Action</option>
              <option value="3">Completed</option>
            </select>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-t-lg">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3">Ministry/Institution</th>
                    <th className="px-6 py-3">Total Records</th>
                    <th className="px-6 py-3">Grade</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dataList.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium">
                        {item.institution_name}
                      </td>
                      <td className="px-6 py-4">
                        {new Intl.NumberFormat("id-ID").format(item.row_count)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`${gradeColor[item.grade]} font-bold text-xs px-2 py-1 rounded`}
                        >
                          Grade {item.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`${statusColor[item.sync_status.toLowerCase()]} text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full`}
                        >
                          {toTitleCase(item.sync_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.sync_status.toLowerCase() === "completed" ||
                        item.sync_status.toLowerCase() === "in progress" ? (
                          <button
                            onClick={() => {
                              if (
                                item.sync_status.toLowerCase() === "completed"
                              ) {
                                showMatchedPage(
                                  item.file_id,
                                  item.institution_name,
                                  item.grade,
                                );
                              }
                            }}
                            disabled={
                              item.sync_status.toLowerCase() === "in progress"
                            }
                            className={`font-medium ${
                              item.sync_status.toLowerCase() === "in progress"
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-blue-600 hover:underline cursor-pointer"
                            }`}
                          >
                            Preview
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              showInvestigationPage(
                                item.file_id,
                                item.institution_name,
                                item.grade,
                              )
                            }
                            className="font-medium text-blue-600 hover:underline cursor-pointer"
                          >
                            Investigate
                          </button>
                        )}
                        
                        {/* ── PERBAIKAN: Tombol Log Hanya Muncul Saat In Progress ── */}
                        {item.sync_status.toLowerCase() === "in progress" && (
                          <button
                            onClick={() => setSelectedLogId(item.file_id)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100 ml-2"
                            title="View Sync & Reasoning Logs"
                          >
                            <Terminal className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {dataList.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        No data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- PAGINATION FOOTER --- */}
          {dataList.length > 0 && (
            <div className="flex justify-between items-center px-4 py-3 bg-white border border-t-0 border-slate-200 rounded-b-lg">
              <span className="text-sm text-slate-600 font-medium">
                Showing Total: {totalRows} records
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={!hasPrev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-slate-300 rounded text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-1.5 text-sm font-medium text-slate-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={!hasNext}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* --- FLOATING LOG MODAL --- */}
      {selectedLogId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-slate-950 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ maxHeight: "80vh" }}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Terminal className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold leading-none">
                    Sync & AI Reasoning Logs
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 font-mono">
                    ID: {selectedLogId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLogId(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body Modal (Log Content) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-1 font-mono text-[13px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {!matchingLogs[selectedLogId] ||
              matchingLogs[selectedLogId].logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-3 opacity-20" />
                  <p className="italic">Waiting for stream data...</p>
                </div>
              ) : (
                matchingLogs[selectedLogId].logs.map((entry, i) => {
                  const colorClass =
                    entry.level === "ERROR"
                      ? "text-red-400"
                      : entry.level === "SUCCESS"
                      ? "text-green-400"
                      : entry.level === "WARN"
                      ? "text-yellow-400"
                      : "text-blue-300";

                  return (
                    <div
                      key={i}
                      className="flex gap-4 border-l border-slate-800 pl-4 hover:bg-white/5 py-0.5 transition-colors group"
                    >
                      <span className="text-slate-600 flex-shrink-0 w-20 group-hover:text-slate-400">
                        {entry.ts
                          ? entry.ts.split("T")[1].split(".")[0]
                          : "--:--:--"}
                      </span>
                      <span className={`${colorClass} leading-6 break-words`}>
                        {entry.message}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-3 bg-slate-900/30 border-t border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                {matchingLogs[selectedLogId]?.isDone ? (
                  <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Full Process Completed
                  </span>
                ) : matchingLogs[selectedLogId]?.isFailed ? (
                  <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                    <XCircle className="w-3.5 h-3.5" /> Process Ended with Errors
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Streaming system log...
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedLogId(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchSynchronization;
