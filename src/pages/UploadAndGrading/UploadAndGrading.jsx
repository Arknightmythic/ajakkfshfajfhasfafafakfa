import {
  Loader2,
  FileText,
  Trash,
  CheckCircle2,
  XCircle,
  FileClock,
  Terminal,
  X,
  List,
  Sparkles,
} from "lucide-react";
import { useState, Fragment, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import useUploadFile from "./hooks/useUploadFile";
import useGetData from "./hooks/useGetData";
import useSync, { listenToSyncStream } from "./hooks/useSync";
import { activateCustomMapping, getCustomMapping } from "./hooks/useCustomMapping";
import { ErrorPopOut } from "../../components/PopOut/ErrorPopOut";
import { SuccessPopOut } from "../../components/PopOut/SuccessPopOut";
import CustomMappingWeightModal from "./components/Custommapingweightmodal";

// PENTING: grade yang dikembalikan /graded_files itu HURUF (rg.grade_code
// hasil JOIN ke tabel ref_grades di retrieval/repository.py), BUKAN angka
// mentah dari kolom uploaded_files.grade. Setelah INSERT (6, 'F') ke
// ref_grades, custom grade akan tampil sebagai string "F".
const CUSTOM_GRADE = "F";

const UploadAndGrading = () => {
  // ── URL State Management ──
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLogId = searchParams.get("log_file_id");

  const setSelectedLogId = (id) => {
    if (id) {
      searchParams.set("log_file_id", id);
      setSearchParams(searchParams);
    } else {
      searchParams.delete("log_file_id");
      setSearchParams(searchParams);
    }
  };

  const [institution, setInstitution] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [fileProgresses, setFileProgresses] = useState({});
  const [matchingLogs, setMatchingLogs] = useState({});

  const { uploadFile } = useUploadFile();
  const {
    data,
    loading,
    error,
    refetch,
    page,
    setPage,
    totalPages,
    hasNext,
    hasPrev,
  } = useGetData();

  // grade dari API adalah huruf (ref_grades.grade_code), sudah dikonfirmasi
  // dari response JSON aslinya ("grade": "A", "D", dst) — bukan angka.
  const getGradeClass = (grade) => {
    switch (grade) {
      case "A":
        return "bg-green-200 text-green-800";
      case "B":
        return "bg-yellow-200 text-yellow-800";
      case "C":
        return "bg-orange-200 text-orange-800";
      case "D":
        return "bg-purple-200 text-purple-800";
      case "E":
        return "bg-red-200 text-red-800";
      case CUSTOM_GRADE:
        return "bg-indigo-200 text-indigo-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // ── EFFECT: Fetch History & Reconnect Stream Saat Refresh ──
  // ── EFFECT: Fetch History & Reconnect Stream Saat Refresh ──
  useEffect(() => {
    if (!selectedLogId) return;

    let isMounted = true;

    // KOSONGKAN array log secara paksa di sini setiap kali modal dibuka / di-refresh.
    // Karena endpoint stream di backend selalu mengulang dari cursor=0,
    // ini mencegah log lama tertimpa ganda dengan log dari stream.
    setMatchingLogs((prev) => ({
      ...prev,
      [selectedLogId]: {
        logs: [],
        isDone: false,
        isFailed: false,
      },
    }));

    const onLog = (payload) => {
      if (!isMounted) return; // Cegah update jika modal sudah ditutup
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

    // Langsung buka koneksi Stream SSE tanpa memanggil endpoint /logs/ lagi.
    // Jika data sudah sukses/gagal di masa lalu, stream otomatis menyemburkan semua log secepat kilat
    // dan langsung diakhiri dengan payload message "__DONE__".
    listenToSyncStream(selectedLogId, onLog, "__MATCHING_DONE__")
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
          refetch(); // Refresh tabel setelah selesai
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Gagal Stream:", err);
        setMatchingLogs((prev) => ({
          ...prev,
          [selectedLogId]: {
            ...(prev[selectedLogId] || { logs: [] }),
            isDone: false,
            isFailed: true,
          },
        }));
      });

    // Cleanup function: hentikan state update jika user klik "Close" atau file berganti
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLogId]);

  // ── Upload handler ──────────────────────────────────────────
  const handleUpload = async () => {
    setIsProcessing(true);

    const initialProgresses = {};
    selectedFiles.forEach((file) => {
      initialProgresses[file.name] = {
        progress: 0,
        status: "Menunggu giliran...",
        isDone: false,
        isError: false,
        show: true,
      };
    });
    setFileProgresses(initialProgresses);

    const handleStreamProgress = (eventData) => {
      const { step, message, filename } = eventData;

      if (filename) {
        setFileProgresses((prev) => {
          const currentFile = prev[filename] || {
            progress: 0,
            status: "",
            isDone: false,
            show: true,
          };
          let newProgress = currentFile.progress;
          let isDone = currentFile.isDone;
          let isError = currentFile.isError;

          if (step === "READING") newProgress = 20;
          else if (step === "CONVERTING") newProgress = 40;
          else if (step === "UPLOADING") newProgress = 60;
          else if (step === "METADATA") newProgress = 80;
          else if (step === "GRADING") newProgress = 90;
          else if (step === "ERROR") isError = true;
          else if (step === "DONE_FILE") {
            newProgress = 100;
            isDone = true;
            setTimeout(() => {
              setFileProgresses((p) => ({
                ...p,
                [filename]: { ...p[filename], show: false },
              }));
            }, 3000);
          }

          return {
            ...prev,
            [filename]: {
              ...currentFile,
              progress: newProgress,
              status: message,
              isDone,
              isError,
            },
          };
        });
      }
    };

    const success = await uploadFile(
      selectedFiles,
      institution,
      handleStreamProgress,
    );

    if (success) {
      SuccessPopOut("Completed", "success", "Semua file berhasil diproses.");
      refetch();
      setInstitution("");
      setSelectedFiles([]);
    } else {
      ErrorPopOut();
    }

    setIsProcessing(false);
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  // ── Sync handler ────────────────────────────────────────────────────────────
  const { mutateAsync: syncByGrade } = useSync();
  const [loadingIds, setLoadingIds] = useState([]);

  const handleSync = async (id) => {
    setLoadingIds((prev) => [...prev, id]);

    setMatchingLogs((prev) => ({
      ...prev,
      [id]: { logs: [], isDone: false, isFailed: false },
    }));

    SuccessPopOut(
      "Synchronizing...",
      "info",
      "Proses pencocokan data sedang berjalan...",
    );

    try {
      const result = await syncByGrade({
        id,
        onLog: null,
        stopKeyword: "__MATCHING_DONE__",
      });
      if (result && result.matching_task_status === "SUCCESS") {
        setMatchingLogs((prev) => ({
          ...prev,
          [id]: { ...prev[id], isDone: true },
        }));

        SuccessPopOut(
          "Matching Completed",
          "success",
          `Sinkronisasi berhasil.`,
        );
        refetch();
      } else {
        console.warn("Sync result:", result);
        ErrorPopOut();
      }
    } catch (err) {
      console.error("Failed Sync:", err);
      setMatchingLogs((prev) => ({
        ...prev,
        [id]: {
          ...(prev[id] || { logs: [] }),
          isFailed: true,
          logs: [
            ...(prev[id]?.logs || []),
            {
              message: err.message || "Gagal menyambung ke server.",
              level: "ERROR",
              ts: new Date().toISOString(),
            },
          ],
        },
      }));
      ErrorPopOut();
    } finally {
      setLoadingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  // ── Custom grading (grade 6) handlers ─────────────────────────────────
  // Endpoint /graded_files belum tentu mengirim kolom is_custom_ready /
  // custom_mapping_task_status (kolom baru), jadi status per-file untuk
  // grade 6 diambil terpisah lewat GET /custom-mapping/{file_id}.
  const [customMappingStatuses, setCustomMappingStatuses] = useState({});
  const [customMappingModalFileId, setCustomMappingModalFileId] = useState(null);
  const [activatingIds, setActivatingIds] = useState([]);

  const fetchCustomMappingStatus = useCallback(async (fileId) => {
    try {
      const res = await getCustomMapping(fileId);
      setCustomMappingStatuses((prev) => ({
        ...prev,
        [fileId]: {
          custom_mapping_task_status: res.custom_mapping_task_status,
          is_custom_ready: res.is_custom_ready,
        },
      }));
    } catch (err) {
      console.warn(
        `Gagal ambil status custom mapping untuk ${fileId}:`,
        err.message,
      );
    }
  }, []);

  // Ambil status awal untuk tiap row grade custom begitu data tabel berubah.
  useEffect(() => {
    if (!data || data.length === 0) return;
    data
      .filter((item) => item.grade === CUSTOM_GRADE)
      .forEach((item) => fetchCustomMappingStatus(item.file_id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Selama ada row custom yang task-nya PROCESSING, poll ulang tiap 3 detik
  // (pola sama dengan background refetch di useGetData).
  useEffect(() => {
    const processingIds = Object.entries(customMappingStatuses)
      .filter(([, v]) => v.custom_mapping_task_status === "PROCESSING")
      .map(([id]) => id);

    if (processingIds.length === 0) return;

    const interval = setInterval(() => {
      processingIds.forEach((id) => fetchCustomMappingStatus(id));
    }, 3000);

    return () => clearInterval(interval);
  }, [customMappingStatuses, fetchCustomMappingStatus]);

  const handleActivateCustomMapping = async (fileId) => {
    setActivatingIds((prev) => [...prev, fileId]);
    try {
      await activateCustomMapping(fileId);
      setCustomMappingStatuses((prev) => ({
        ...prev,
        [fileId]: {
          custom_mapping_task_status: "PROCESSING",
          is_custom_ready: false,
        },
      }));
      SuccessPopOut(
        "Diproses",
        "info",
        "AI sedang memetakan kolom file custom...",
      );
    } catch (err) {
      console.error("Gagal activate custom mapping:", err);
      ErrorPopOut();
    } finally {
      setActivatingIds((prev) => prev.filter((x) => x !== fileId));
    }
  };

  const handleCustomMappingSaved = (fileId) => {
    setCustomMappingModalFileId(null);
    setCustomMappingStatuses((prev) => ({
      ...prev,
      [fileId]: { ...prev[fileId], is_custom_ready: true },
    }));
    refetch();
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Page</h3>
          <p className="text-red-600 mt-1">{error.message}</p>
        </div>

      </div>
    );
  }

  const visibleProgresses = Object.entries(fileProgresses).filter(
    (entry) => entry[1].show,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Kolom 1: Formulir Upload */}
      <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col">
        <h3 className="font-semibold text-lg mb-4">1. Upload Data File</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700">
            Ministry / Institution Name
          </label>
          <input
            disabled={isProcessing}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
            placeholder="e.g., Ministry of Health"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
          />
        </div>
        <div
          className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors ${
            isProcessing
              ? "border-slate-200 bg-slate-50"
              : "border-slate-900/25"
          }`}
        >
          <div className="text-center">
            {isProcessing ? (
              <Loader2 className="mx-auto h-10 w-10 text-slate-400 animate-spin" />
            ) : (
              <FileText className="mx-auto h-10 w-10 text-slate-400" />
            )}
            <div className="mt-4 flex text-sm text-slate-600 justify-center">
              <label
                className={`relative cursor-pointer rounded-md font-semibold ${
                  isProcessing
                    ? "text-slate-400 cursor-not-allowed"
                    : "text-blue-600 hover:text-blue-500"
                }`}
              >
                <span>
                  {isProcessing ? "Sedang memproses..." : "Upload a file"}
                </span>
                {!isProcessing && (
                  <input
                    type="file"
                    multiple
                    accept=".csv"
                    className="sr-only"
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files);
                      setSelectedFiles((prev) => {
                        const existingNames = new Set(prev.map((f) => f.name));
                        return [
                          ...prev,
                          ...newFiles.filter((f) => !existingNames.has(f.name)),
                        ];
                      });
                      e.target.value = "";
                    }}
                  />
                )}
              </label>
              {!isProcessing && <p className="pl-1">or drag and drop</p>}
            </div>
            {!isProcessing && (
              <p className="text-xs text-slate-500 mt-2">CSV files only</p>
            )}
          </div>
        </div>

        {/* Daftar file terpilih */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-xs text-slate-700 truncate">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveFile(idx)}
                  disabled={isProcessing}
                  className="ml-2 flex-shrink-0 text-slate-400 hover:text-red-500 disabled:cursor-not-allowed"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={
            isProcessing || selectedFiles.length === 0 || !institution.trim()
          }
          className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
              Processing...
            </>
          ) : (
            "Upload & Grade"
          )}
        </button>
      </div>

      {/* Kolom 2: Progress upload */}
      <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col">
        <h3 className="font-semibold text-lg mb-4">2. Upload Progress</h3>
        {visibleProgresses.length > 0 ? (
          <div className="space-y-4 overflow-y-auto max-h-96 pr-1">
            {visibleProgresses.map(([filename, itemData]) => (
              <div
                key={filename}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[70%]">
                    {filename}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      itemData.isError
                        ? "bg-red-200 text-red-800"
                        : itemData.isDone
                          ? "bg-green-200 text-green-800"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {itemData.progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className={`h-2 rounded-full relative transition-all duration-500 ease-out ${
                      itemData.isError
                        ? "bg-red-500"
                        : itemData.isDone
                          ? "bg-green-500"
                          : "bg-blue-600"
                    }`}
                    style={{ width: `${itemData.progress}%` }}
                  >
                    {!itemData.isDone && !itemData.isError && (
                      <div className="absolute top-0 bottom-0 left-0 w-full bg-white/20 animate-[translateX_1.5s_infinite_linear] skew-x-[45deg] -translate-x-full" />
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  {!itemData.isDone &&
                  !itemData.isError &&
                  itemData.progress > 0 ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin mt-0.5 flex-shrink-0" />
                  ) : itemData.isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : itemData.isError ? (
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <FileClock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  )}
                  <p
                    className={`text-xs leading-tight flex-1 font-medium ${
                      itemData.isError ? "text-red-700" : "text-slate-600"
                    }`}
                  >
                    {itemData.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-100 rounded-xl h-full animate-in fade-in duration-500 min-h-[250px]">
            <p className="text-sm text-slate-500">
              Silakan upload file untuk memulai proses grading.
              <br />
              Status tahapan akan ditampilkan di sini.
            </p>
          </div>
        )}
      </div>

      {/* Kolom 3: Tabel Data */}
      <div className="lg:col-span-2 mt-8 bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Upload & Grading History</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!hasPrev || loading}
              className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={!hasNext || loading}
              className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="min-h-[300px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-3">Ministry / Institution</th>
                  <th className="px-6 py-3">File</th>
                  <th className="px-6 py-3">Total Records</th>
                  <th className="px-6 py-3">Dataset Grade</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <Loader2 className="animate-spin w-8 h-8 mx-auto text-blue-600 mb-2" />
                      <p className="text-slate-500">Fetching records...</p>
                    </td>
                  </tr>
                ) : !data || data.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-6">
                      No data found
                    </td>
                  </tr>
                ) : (
                  [...data]
                    .sort(
                      (a, b) =>
                        new Date(b.upload_timestamp) -
                        new Date(a.upload_timestamp),
                    )
                    .map((item, index) => {
                      const isRowProcessing =
                        loadingIds.includes(item.file_id) ||
                        item.matching_task_status === "PROCESSING";
                      const isSynced =
                        item.is_sync === 1 ||
                        item.matching_task_status === "SUCCESS";
                      const isFailed = item.matching_task_status === "FAILED";

                      // ── Grade 6 (custom): matching gak boleh dimulai sebelum
                      // user mengonfirmasi field pairing + weight-nya.
                      const isCustomGrade = item.grade === CUSTOM_GRADE;
                      const customStatus =
                        customMappingStatuses[item.file_id];
                      const customTaskStatus =
                        customStatus?.custom_mapping_task_status;
                      const isCustomReady = customStatus?.is_custom_ready;
                      const isActivating = activatingIds.includes(
                        item.file_id,
                      );

                      return (
                        <Fragment key={item.file_id || index}>
                          <tr className="bg-white border-b border-slate-200 hover:bg-gray-50">
                            <td className="px-6 py-4">
                              {item.institution_name}
                            </td>
                            <td className="px-6 py-4">
                              {item.original_filename}
                            </td>
                            <td className="px-6 py-4">
                              {new Intl.NumberFormat("id-ID").format(
                                item.row_count,
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`font-bold text-xs px-2 py-1 rounded ${getGradeClass(
                                  item.grade,
                                )}`}
                              >
                                {isCustomGrade ? "Custom" : `Grade ${item.grade}`}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={
                                  item.processing_status?.toUpperCase() ===
                                  "GRADED"
                                    ? "bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                                    : "text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full"
                                }
                              >
                                {item.processing_status?.toUpperCase() ===
                                "GRADED"
                                  ? "Grading Complete"
                                  : item.processing_status}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                {isCustomGrade && !isCustomReady ? (
                                  // ── Belum siap sync: tampilkan tahapan custom mapping ──
                                  customTaskStatus === "PROCESSING" ? (
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600">
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      AI Mapping Fields...
                                    </span>
                                  ) : customTaskStatus === "SUCCESS" ? (
                                    <button
                                      onClick={() =>
                                        setCustomMappingModalFileId(
                                          item.file_id,
                                        )
                                      }
                                      className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:bg-indigo-50 rounded-lg px-3 py-1.5 transition-colors"
                                    >
                                      <Sparkles className="w-3.5 h-3.5" />
                                      Review & Set Weights
                                    </button>
                                  ) : (
                                    <button
                                      disabled={isActivating}
                                      onClick={() =>
                                        handleActivateCustomMapping(
                                          item.file_id,
                                        )
                                      }
                                      className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 border transition-colors ${
                                        isActivating
                                          ? "text-slate-400 border-slate-200 cursor-not-allowed"
                                          : customTaskStatus === "FAILED"
                                            ? "text-red-600 border-red-200 hover:bg-red-50"
                                            : "text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                      }`}
                                    >
                                      {isActivating ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Sparkles className="w-3.5 h-3.5" />
                                      )}
                                      {customTaskStatus === "FAILED"
                                        ? "Mapping Failed (Retry)"
                                        : "Configure Custom Grading"}
                                    </button>
                                  )
                                ) : (
                                  <>
                                    <button
                                      disabled={isRowProcessing || isSynced}
                                      onClick={() => handleSync(item.file_id)}
                                      className={`font-medium ${
                                        isSynced
                                          ? "text-green-600 cursor-not-allowed"
                                          : isRowProcessing
                                            ? "text-slate-400 cursor-not-allowed"
                                            : isFailed
                                              ? "text-red-600 hover:underline"
                                              : "text-blue-600 hover:underline"
                                      }`}
                                    >
                                      {isSynced
                                        ? "Synced"
                                        : isRowProcessing
                                          ? "Processing..."
                                          : isFailed
                                            ? "Failed (Retry)"
                                            : "Start Synchronization"}
                                    </button>

                                    {/* Tombol Log: Hanya muncul saat status = Processing */}
                                    {isRowProcessing && (
                                      <button
                                        onClick={() =>
                                          setSelectedLogId(item.file_id)
                                        }
                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                        title="View Matching Log"
                                      >
                                        <Terminal className="w-4 h-4" />
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        </Fragment>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && (
          <div className="flex items-center justify-between mt-6 border-t border-slate-200 pt-4">
            <span className="text-sm text-slate-600">
              Showing page{" "}
              <span className="font-semibold text-slate-900">{page}</span> of{" "}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </span>
          </div>
        )}
      </div>

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
                    Matching System Logs
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
                  <p className="italic">Waiting for system response...</p>
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
                    <CheckCircle2 className="w-3.5 h-3.5" /> Process Completed
                  </span>
                ) : matchingLogs[selectedLogId]?.isFailed ? (
                  <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                    <XCircle className="w-3.5 h-3.5" /> Process Failed
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> System
                    processing...
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

      {/* --- CUSTOM FIELD MAPPING MODAL (grade 6) --- */}
      {customMappingModalFileId && (
        <CustomMappingWeightModal
          fileId={customMappingModalFileId}
          onClose={() => setCustomMappingModalFileId(null)}
          onSaved={handleCustomMappingSaved}
        />
      )}
    </div>
  );
};

export default UploadAndGrading;