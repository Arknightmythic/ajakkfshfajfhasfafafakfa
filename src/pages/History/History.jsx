import { useState } from "react";
import { Search, Loader2, Filter } from "lucide-react";
import RangeCalendarFilter from "./Calendar";
import useHistory from "./hooks/useHistory";
import useFileDownloader from "./hooks/useDownload.js";

const History = () => {
  // State untuk kontrol Search dan Filter
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
  });

  const { isDownloading, downloadFile } = useFileDownloader();

  // Helper function untuk format tanggal ke API (YYYY-MM-DD)
  const formatDateForApi = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toISOString().split("T")[0];
  };

  // Fetch dari Hook dengan parameter baru
  const {
    data: historyDataList,
    loading,
    error,
    totalPages,
    hasNext,
    hasPrev,
    totalRows,
  } = useHistory({
    page,
    institution_name: searchTerm,
    start_date: formatDateForApi(dateFilter.startDate),
    end_date: formatDateForApi(dateFilter.endDate),
  });

  const handleDownload = (item, type) => {
    downloadFile(item.file_id, type);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num || 0);
  };

  const highlightSearchTerm = (text, search, highlight = true) => {
    if (!text || !search?.trim() || !highlight) return text || "";
    const regex = new RegExp(
      `(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    return text
      .split(regex)
      .map((part, i) =>
        regex.test(part) ? <mark key={i}>{part}</mark> : part,
      );
  };

  if (loading && historyDataList.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 mx-auto mb-4 text-blue-600 mt-5" />
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
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="historyPage"
      className={`relative ${isDownloading ? "cursor-progress" : ""}`}
    >
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Filter Tanggal */}
            <div className="flex flex-row gap-3">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Filters:
                </span>
              </div>
              <RangeCalendarFilter
                onDateChange={(start, end) => {
                  setDateFilter({ startDate: start, endDate: end });
                  setPage(1); // Reset page saat tanggal diubah
                }}
                startDate={dateFilter.startDate}
                endDate={dateFilter.endDate}
              />
            </div>

            {/* Search Input ala Batch Synchronization */}
            <div className="flex-grow sm:flex-grow-0 w-full sm:w-[300px]">
              <div className="flex items-center border border-slate-300 rounded-md overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-white transition-all w-full">
                <input
                  type="text"
                  placeholder="Search institutions..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearchTerm(searchInput);
                      setPage(1);
                    }
                  }}
                  className="w-full pl-4 pr-2 py-2 text-sm focus:outline-none bg-transparent border-none"
                />
                <button
                  onClick={() => {
                    setSearchTerm(searchInput);
                    setPage(1);
                  }}
                  className="px-3 py-2.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors focus:outline-none flex items-center justify-center cursor-pointer border-l border-slate-200"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto border border-slate-200 rounded-t-lg">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-3">Ministry/Institution</th>
                  <th className="px-6 py-3">Upload Date</th>
                  <th className="px-6 py-3">Auto Matched</th>
                  <th className="px-6 py-3">Manual Matched</th>
                  <th className="px-6 py-3">Unmatched</th>
                  <th className="px-6 py-3">% Unmatched</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {historyDataList?.length > 0 ? (
                  historyDataList.map((item, idx) => (
                    <tr
                      key={item.metadata_id || idx}
                      className="bg-white border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium">
                        {highlightSearchTerm(
                          item.institution_name,
                          searchTerm,
                          false,
                        )}
                      </td>
                      {/* Mapping API key yang baru */}
                      <td className="px-6 py-4">
                        {item.upload_timestamp
                          ? item.upload_timestamp.split("T")[0]
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-green-600 font-medium">
                        {formatNumber(item.total_auto_match)}
                      </td>
                      <td className="px-6 py-4 text-blue-600 font-medium">
                        {formatNumber(item.total_manual_match)}
                      </td>
                      <td className="px-6 py-4 text-red-600 font-medium">
                        {formatNumber(item.total_unmatch)}
                      </td>
                      <td className="px-6 py-4 text-red-600 font-medium">
                        {formatNumber(item.percentage_unmatch?.toFixed(2))}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium border-x border-slate-200">
                        <div className="flex gap-2 justify-end">
                          {/* Tombol Download Match */}
                          <button
                            onClick={() => handleDownload(item, "match")}
                            disabled={
                              item.export_status !== "READY" || isDownloading
                            }
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                              item.export_status !== "READY"
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                            }`}
                          >
                            {item.export_status === "PROCESSING"
                              ? "Generating CSV..."
                              : item.export_status === "FAILED"
                                ? "Export Failed"
                                : "Download Match"}
                          </button>

                          {/* Tombol Download Unmatch */}
                          <button
                            onClick={() => handleDownload(item, "unmatch")}
                            disabled={
                              item.export_status !== "READY" || isDownloading
                            }
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                              item.export_status !== "READY"
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                            }`}
                          >
                            {item.export_status === "PROCESSING"
                              ? "Generating CSV..."
                              : item.export_status === "FAILED"
                                ? "Export Failed"
                                : "Download Unmatch"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Search size={24} className="text-gray-300" />
                        <p>No records found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Footer (Mengikuti Desain Batch Synchronization) */}
        {historyDataList?.length > 0 && (
          <div className="flex justify-between items-center px-4 py-3 bg-white border border-t-0 border-slate-200 rounded-b-lg">
            <span className="text-sm text-slate-600 font-medium">
              Showing Total: {formatNumber(totalRows)} records
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
    </div>
  );
};

export default History;
