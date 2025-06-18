import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { FileText, FileX2 } from "lucide-react";
import { Trash } from 'lucide-react';

const UploadAndGrading = () => {
  const [institution, setInstitution] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [lastUploadedFile, setLastUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseOK, setResponseOK] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const data = [
  {
    institution: 'Ministry of Social Affairs',
    file: 'data.csv',
    total: 1000,
    grade: 'Grade A',
    status: 'Grading Complete',
  },
  {
    institution: 'Ministry of Education',
    file: 'data_edu.csv',
    total: 750,
    grade: 'Grade B',
    status: 'Grading Complete',
  },
  {
    institution: 'Ministry of Health',
    file: 'health.xlsx',
    total: 500,
    grade: 'Grade C',
    status: 'Grading Complete',
  },
  {
    institution: 'Ministry of Transport',
    file: 'transport.csv',
    total: 300,
    grade: 'Grade D',
    status: 'Grading Complete',
  },
  {
    institution: 'Ministry of Transport',
    file: 'transport-car.csv',
    total: 300,
    grade: 'Grade E',
    status: 'Grading Complete',
  },
  ];

  const [filteredData, setFilteredData] = useState(data);

  const getGradeClass = (grade) => {
    switch (grade) {
      case 'Grade A':
        return 'bg-green-200 text-green-800';
      case 'Grade B':
        return 'bg-yellow-200 text-yellow-800';
      case 'Grade C':
        return 'bg-orange-200 text-orange-800';
      case 'Grade D':
        return 'bg-purple-200 text-purple-800';
      case 'Grade E':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const handleUpload = () => {
    setIsProcessing(true);
    setResponseOK(false);
    setLastUploadedFile(selectedFile);

    setInstitution("");
    setSelectedFile(null);
  };

  const handleDeleteFile = () => {
    setSelectedFile(null);
  };

  useEffect(() => {
    const search = searchTerm.toLowerCase();
    const result = data.filter(item =>
      item.institution.toLowerCase().includes(search) ||
      item.file.toLowerCase().includes(search) ||
      item.grade.toLowerCase().includes(search)
    );
    setFilteredData(result);
  }, [searchTerm]);

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
                    onChange={(e) => setSelectedFile(e.target.files[0])}
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
              {filteredData.map((item, index) => (
                <tr key={index} className="bg-white border-b border-slate-200 hover:bg-gray-50">
                  <td className="px-6 py-4">{item.institution}</td>
                  <td className="px-6 py-4">{item.file}</td>
                  <td className="px-6 py-4">{item.total}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold text-xs px-2 py-1 rounded ${getGradeClass(item.grade)}`}>
                      {item.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="font-medium text-blue-600 hover:underline cursor-pointer">Start Synchronization</button>
                  </td>
                </tr>
              ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UploadAndGrading;
