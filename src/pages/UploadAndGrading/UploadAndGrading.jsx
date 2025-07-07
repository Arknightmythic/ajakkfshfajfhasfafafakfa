import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { FileText, FileX2 } from "lucide-react";
import { Trash } from 'lucide-react';
import useUploadFile from "./hooks/useUploadFile";
import useGetData from "./hooks/useGetData";
import useSync from "./hooks/useSync";
import { ErrorPopOut } from "../../components/PopOut/ErrorPopOut";
import { SuccessPopOut } from "../../components/PopOut/SuccessPopOut";

const UploadAndGrading = () => {
  const [institution, setInstitution] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [lastUploadedFile, setLastUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseOK, setResponseOK] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { uploadFile, isUploading } = useUploadFile();

  const { data, loading, error, refetch } = useGetData();

  const [filteredData, setFilteredData] = useState([]);
  useEffect(() => {
    if (!data || data.length === 0) {
      setFilteredData([]);
      return;
    }

    const search = searchTerm.toLowerCase();
    const result = data.filter(item =>
      (item.institution_name || '').toLowerCase().includes(search) ||
      (item.file_name || '').toLowerCase().includes(search) ||
      (item.grade || '').toLowerCase().includes(search)
    );

    setFilteredData(result);
  }, [searchTerm, data]);


  const getGradeClass = (grade) => {
    switch (grade) {
      case 'A':
        return 'bg-green-200 text-green-800';
      case 'B':
        return 'bg-yellow-200 text-yellow-800';
      case 'C':
        return 'bg-orange-200 text-orange-800';
      case 'D':
        return 'bg-purple-200 text-purple-800';
      case 'E':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const handleUpload = async () => {
    setIsProcessing(true);
    setResponseOK(false);
    setLastUploadedFile(selectedFile);

    const success = await uploadFile(selectedFile, institution);

    if (success) {
      setResponseOK(true);
      refetch()
    } else {
      ErrorPopOut()
    }

    setInstitution("");
    setSelectedFile(null);
  };

  const handleDeleteFile = () => {
    setSelectedFile(null);
  };

  const { mutateAsync: syncByGrade, isPending, isError, error:syncError } = useSync();
  const [loadingIds, setLoadingIds] = useState([]);

  const handleSync = async (id, grade) => {
    setLoadingIds((prev) => [...prev, id]);
    SuccessPopOut(
      "Synchronizing...",
      "info",
      "You can go to Batch Synchronization menu to check the the progress."
    );

    try {
      const result = await syncByGrade({ id, grade });
      if (!result) ErrorPopOut();
    } catch (err) {
      console.error("Failed:", err);
      ErrorPopOut();
    } finally {
      setLoadingIds((prev) => prev.filter((x) => x !== id));
    }
  };


  if (loading) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <Loader2 className='animate-spin w-8 h-8 mx-auto mb-4 text-blue-600' />
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

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


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-semibold text-lg mb-4">1. Upload Data File</h3>
        <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700">Ministry / Institution Name</label>
            <input
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., Ministry of Health"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
          />
        </div>
        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-900/25 px-6 py-10">
          <div className="text-center">
            <i data-lucide="file-up" className="mx-auto h-12 w-12 text-slate-300"></i>
            <div className="mt-4 flex text-sm leading-6 text-slate-600">
              <label
                className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
              >
                <span>Choose a file</span>
                <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      const maxSize = 3.5 * 1024 * 1024 * 1024;

                      if (file && file.size > maxSize) {
                        alert("**The file is too large. The maximum allowed size is 3.5GB.*");
                        e.target.value = null;
                        return;
                      }

                      setSelectedFile(file);
                    }}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-slate-600">CSV, XLSX</p>
          </div>
        </div>

        {selectedFile && (
          <div className="mt-4 flex items-center justify-between bg-slate-100 px-4 py-2 rounded">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              {selectedFile.name.endsWith(".csv") || selectedFile.name.endsWith(".xls") || selectedFile.name.endsWith(".xlsx") ? (
                <FileText className="w-5 h-5 text-blue-600" />
              ) : (
                <FileText className="w-5 h-5 text-slate-500" />
              )}
              <span>{selectedFile.name}</span>
            </div>
            <button onClick={handleDeleteFile}>
              <Trash className="w-5 h-5 text-red-500 hover:text-red-700 cursor-pointer" />
            </button>
          </div>
        )}

        <button
          disabled={!institution || !selectedFile}
          onClick={handleUpload}
          className={`mt-4 w-full px-4 py-2 rounded-md text-white ${
            !institution || !selectedFile
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
          }`}
        >
          Start Grading Process
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-semibold text-lg mb-4">2. Grading Status</h3>
        <div className="space-y-4">
          {isProcessing && !responseOK && lastUploadedFile ? (
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">{lastUploadedFile.name}</span>
                <span className="text-sm font-medium text-blue-700 animate-pulse">Processing...</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Please upload a file to begin the grading process. Status will be shown here.
            </p>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 mt-8 bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Upload & Grading History</h3>
            <div className="relative">
                <input
                  placeholder="Search..."
                  className="pl-8 pr-4 py-2 border border-slate-300 rounded-md text-sm w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
        </div>
        <div className="overflow-x-auto">
          <div className="max-h-[500px] overflow-y-auto">
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
                {filteredData.length === 0 ||  filteredData.every(item => item.status_grading === null) ? (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-6">
                      No data found
                    </td>
                  </tr>
                ): (
                  [...filteredData]
                  .sort((a, b) => new Date(b.inserted_date) - new Date(a.inserted_date))
                  .map((item, index) => (
                  <tr key={index} className="bg-white border-b border-slate-200 hover:bg-gray-50">
                    <td className="px-6 py-4">{item.institution_name}</td>
                    <td className="px-6 py-4">{item.file_name}</td>
                    <td className="px-6 py-4">{item.total_records}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold text-xs px-2 py-1 rounded ${getGradeClass(item.grade)}`}>
                        Grade {item.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          item.status_grading?.toLowerCase() === "completed"
                            ? "bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                            : "text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full"
                        }
                      >
                        {item.status_grading?.toLowerCase() === "completed" ? "Grading Complete" : item.status_grading}
                      </span>

                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        disabled={loadingIds.includes(item.id) || item.status_proses != null}
                        onClick={() => handleSync(item.id, item.grade)}
                        className={`font-medium text-blue-600 ${
                          loadingIds.includes(item.id) || item.status_proses != null
                            ? "cursor-not-allowed text-slate-400 hover:no-underline"
                            : "hover:underline cursor-pointer"
                        }`}
                      >
                      Start Synchronization
                      </button>
                    </td>
                  </tr>
                )))}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadAndGrading;
