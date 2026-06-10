import { Loader2, FileText, Trash, CheckCircle2, XCircle, FileClock } from "lucide-react";
import { useState, } from "react";
import useUploadFile from "./hooks/useUploadFile";
import useGetData from "./hooks/useGetData";
import useSync from "./hooks/useSync";
import { ErrorPopOut } from "../../components/PopOut/ErrorPopOut";
import { SuccessPopOut } from "../../components/PopOut/SuccessPopOut";

const UploadAndGrading = () => {
  const [institution, setInstitution] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]); 
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State untuk menampung progress setiap file yang di-upload
  // Format: { "nama_file.csv": { progress: 0, status: "", isDone: false, show: true } }
  const [fileProgresses, setFileProgresses] = useState({});

  const { uploadFile } = useUploadFile();
  const { data, loading, error, refetch, page, setPage, totalPages, hasNext, hasPrev } = useGetData();

  const getGradeClass = (grade) => {
    switch (grade) {
      case 'A': return 'bg-green-200 text-green-800';
      case 'B': return 'bg-yellow-200 text-yellow-800';
      case 'C': return 'bg-orange-200 text-orange-800';
      case 'D': return 'bg-purple-200 text-purple-800';
      case 'E': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const handleUpload = async () => {
    setIsProcessing(true);

    // Inisialisasi progress untuk masing-masing file yang akan diupload
    const initialProgresses = {};
    selectedFiles.forEach(file => {
      initialProgresses[file.name] = { 
        progress: 0, 
        status: "Menunggu giliran...", 
        isDone: false, 
        isError: false,
        show: true 
      };
    });
    setFileProgresses(initialProgresses);

    const handleStreamProgress = (eventData) => {
      const { step, message, filename } = eventData;

      // Update hanya state milik filename yang bersangkutan
      if (filename) {
        setFileProgresses(prev => {
          // Fallback jika state untuk file belum ada
          const currentFile = prev[filename] || { progress: 0, status: "", isDone: false, show: true };
          let newProgress = currentFile.progress;
          let isDone = currentFile.isDone;
          let isError = currentFile.isError;

          if (step === 'READING') newProgress = 20;
          else if (step === 'CONVERTING') newProgress = 40;
          else if (step === 'UPLOADING') newProgress = 60;
          else if (step === 'METADATA') newProgress = 80;
          else if (step === 'GRADING') newProgress = 90;
          else if (step === 'ERROR') {
              isError = true;
          }
          else if (step === 'DONE_FILE') {
            newProgress = 100;
            isDone = true;
            
            // Set Timer 3 detik untuk menghilangkan progress bar ini secara individu
            setTimeout(() => {
              setFileProgresses(p => ({
                ...p,
                [filename]: { ...p[filename], show: false }
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
              isError
            }
          };
        });
      }
    };

    const success = await uploadFile(selectedFiles, institution, handleStreamProgress);

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
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const { mutateAsync: syncByGrade } = useSync();
  const [loadingIds, setLoadingIds] = useState([]);

  // Fungsi Sync tidak lagi menggunakan param 'grade'
  const handleSync = async (id) => {
    setLoadingIds((prev) => [...prev, id]);
    SuccessPopOut(
      "Synchronizing...",
      "info",
      "Proses pencocokan data sedang berjalan..."
    );

    try {
      const result = await syncByGrade({ id }); 
      
      if (result && result.message) {
        SuccessPopOut(
          "Matching Completed",
          "success",
          `${result.message}. Matched: ${result.matched_rows?.toLocaleString() || 0} baris | Unmatched: ${result.unmatched_rows?.toLocaleString() || 0} baris.`
        );
        refetch(); // Merefresh tabel agar tombol berubah menjadi 'Synced'
      } else {
        ErrorPopOut();
      }
    } catch (err) {
      console.error("Failed Sync:", err);
      ErrorPopOut();
    } finally {
      setLoadingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <h3 className='text-red-800 font-medium'>Error Loading Page</h3>
          <p className='text-red-600 mt-1'>{error.message}</p>
        </div>
      </div>
    );
  }

  // Menggunakan argumen tunggal (entry) untuk menghindari error unused variable "_" 
  const visibleProgresses = Object.entries(fileProgresses).filter((entry) => entry[1].show);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Kolom 1: Formulir Upload */}
      <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col">
        <h3 className="font-semibold text-lg mb-4">1. Upload Data File</h3>
        <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700">Ministry / Institution Name</label>
            <input
              disabled={isProcessing} 
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              placeholder="e.g., Ministry of Health"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
          />
        </div>
        <div className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors ${isProcessing ? 'border-slate-200 bg-slate-50' : 'border-slate-900/25'}`}>
          <div className="text-center">
            <i data-lucide="file-up" className="mx-auto h-12 w-12 text-slate-300"></i>
            <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
              <label className={`relative rounded-md font-semibold focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 ${isProcessing ? 'text-slate-400 cursor-not-allowed' : 'bg-white text-blue-600 focus-within:ring-blue-600 hover:text-blue-500 cursor-pointer'}`}>
                <span>Choose files</span>
                <input
                    type="file"
                    multiple 
                    disabled={isProcessing} 
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="sr-only"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      const maxSize = 3.5 * 1024 * 1024 * 1024;
                      
                      const validFiles = files.filter(file => {
                        if (file.size > maxSize) {
                          alert(`*File ${file.name} is too large. The maximum allowed size is 3.5GB.*`);
                          return false;
                        }
                        return true;
                      });

                      setSelectedFiles(prev => [...prev, ...validFiles]);
                      e.target.value = null; 
                    }}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-slate-600">CSV, XLSX</p>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2 flex-grow">
            {selectedFiles.map((file, index) => {
              const isExcelOrCSV = file.name.endsWith(".csv") || file.name.endsWith(".xls") || file.name.endsWith(".xlsx");
              return (
                <div key={index} className={`flex items-center justify-between px-4 py-2 rounded ${isProcessing ? 'bg-slate-50 opacity-70' : 'bg-slate-100'}`}>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <FileText className={`w-5 h-5 ${isExcelOrCSV ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="truncate max-w-[250px]">{file.name}</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveFile(index)} 
                    type="button"
                    disabled={isProcessing} 
                    className="disabled:cursor-not-allowed"
                  >
                    <Trash className={`w-5 h-5 transition-colors ${isProcessing ? 'text-slate-300' : 'text-red-500 hover:text-red-700 cursor-pointer'}`} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <button
          disabled={!institution || selectedFiles.length === 0 || isProcessing}
          onClick={handleUpload}
          className={`mt-4 w-full px-4 py-2 rounded-md text-white flex items-center justify-center gap-2 font-medium transition-colors ${
            !institution || selectedFiles.length === 0 || isProcessing
              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
          }`}
        >
          {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
          {isProcessing ? "Processing..." : "Start Grading Process"}
        </button>
      </div>

      {/* Kolom 2: Status Progress Bar Multipel */}
      <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col">
        <h3 className="font-semibold text-lg mb-4">2. Grading Status</h3>
        <div className="flex-1">
          {visibleProgresses.length > 0 ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {visibleProgresses.map(([filename, itemData]) => (
                <div key={filename} className={`p-4 rounded-xl border shadow-sm transition-all duration-300 ${
                  itemData.isError ? 'bg-red-50 border-red-200' :
                  itemData.isDone ? 'bg-green-50 border-green-200' :
                  'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700 truncate max-w-[200px]" title={filename}>
                      {filename}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      itemData.isError ? 'bg-red-200 text-red-800' :
                      itemData.isDone ? 'bg-green-200 text-green-800' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {itemData.progress}%
                    </span>
                  </div>
                  
                  {/* Progress Bar Item Container */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-3">
                    <div 
                      className={`h-2 rounded-full relative transition-all duration-500 ease-out ${
                        itemData.isError ? 'bg-red-500' :
                        itemData.isDone ? 'bg-green-500' : 
                        'bg-blue-600'
                      }`} 
                      style={{ width: `${itemData.progress}%` }}
                    >
                       {!itemData.isDone && !itemData.isError && (
                         <div className="absolute top-0 bottom-0 left-0 w-full bg-white/20 animate-[translateX_1.5s_infinite_linear] skew-x-[45deg] -translate-x-full"></div>
                       )}
                    </div>
                  </div>

                  {/* Status Message Text */}
                  <div className="flex items-start gap-2">
                     {!itemData.isDone && !itemData.isError && itemData.progress > 0 ? (
                       <Loader2 className="w-4 h-4 text-blue-600 animate-spin mt-0.5 flex-shrink-0" />
                     ) : itemData.isDone ? (
                       <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                     ) : itemData.isError ? (
                       <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                     ) : (
                       <FileClock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                     )}
                     <p className={`text-xs leading-tight flex-1 font-medium ${
                       itemData.isError ? 'text-red-700' : 'text-slate-600'
                     }`}>
                       {itemData.status}
                     </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-100 rounded-xl h-full animate-in fade-in duration-500 min-h-[250px]">
               <p className="text-sm text-slate-500">
                 Silakan upload file untuk memulai proses grading.<br/>Status tahapan akan ditampilkan di sini.
               </p>
            </div>
          )}
        </div>
      </div>

      {/* Kolom 3: Tabel Data */}
      <div className="lg:col-span-2 mt-8 bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Upload & Grading History</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!hasPrev || loading}
                className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
                ) : (!data || data.length === 0) ? (   // <--- Kurung kurawal "{" di awal sudah dihapus di sini
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-6">
                      No data found
                    </td>
                  </tr>
                ) : (
                  [...data]
                  .sort((a, b) => new Date(b.upload_timestamp) - new Date(a.upload_timestamp))
                  .map((item, index) => {
                    // --- VARIABEL STATUS ---
                    const isRowProcessing = loadingIds.includes(item.file_id) || item.matching_task_status === 'PROCESSING';
                    const isSynced = item.is_sync === 1 || item.matching_task_status === 'SUCCESS';
                    const isFailed = item.matching_task_status === 'FAILED';

                    return (
                      <tr key={index} className="bg-white border-b border-slate-200 hover:bg-gray-50">
                        <td className="px-6 py-4">{item.institution_name}</td>
                        <td className="px-6 py-4">{item.original_filename}</td>
                        <td className="px-6 py-4">{new Intl.NumberFormat('id-ID').format(item.row_count)}</td>
                        <td className="px-6 py-4">
                          <span className={`font-bold text-xs px-2 py-1 rounded ${getGradeClass(item.grade)}`}>
                            Grade {item.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={
                              item.processing_status?.toUpperCase() === "GRADED"
                                ? "bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                                : "text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full"
                            }
                          >
                            {item.processing_status?.toUpperCase() === "GRADED" ? "Grading Complete" : item.processing_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            disabled={isRowProcessing || isSynced}
                            onClick={() => handleSync(item.file_id)}
                            className={`font-medium ${
                              isSynced 
                                ? "cursor-not-allowed text-green-600" 
                                : isRowProcessing
                                  ? "cursor-not-allowed text-slate-400"
                                  : isFailed
                                    ? "text-red-600 hover:underline cursor-pointer"
                                    : "text-blue-600 hover:underline cursor-pointer"
                            }`}
                          >
                            {isSynced 
                              ? 'Synced' 
                              : isRowProcessing 
                                ? 'Processing...' 
                                : isFailed
                                  ? 'Failed (Retry)'
                                  : 'Start Synchronization'
                            }
                          </button>
                        </td>
                      </tr>
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
              Showing page <span className="font-semibold text-slate-900">{page}</span> of <span className="font-semibold text-slate-900">{totalPages}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadAndGrading;