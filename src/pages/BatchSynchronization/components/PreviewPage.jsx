import React from "react";
import { ArrowLeft } from "lucide-react";
import TableHeader from "./TableHeader";
import { useLocation, useNavigate } from "react-router-dom";
import useGetPreviewData from "../hooks/useGetDataPreview";

const PreviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  
  const file_id = location.state?.metadata_id || queryParams.get("file_id");
  const institutionName = location.state?.institutionName || queryParams.get("name") || "State Civil Service Agency";
  const statusGrade = location.state?.statusGrade || queryParams.get("grade") || "Unknown";
  const { data, isLoading, error } = useGetPreviewData(file_id);

  const sortedData = React.useMemo(() => {
    if (!data) return { match: [], unmatch: [] };

    const sortedMatch = [...(data.match || [])].sort((a, b) => a.institution.id - b.institution.id);
    const sortedUnmatch = [...(data.unmatch || [])].sort((a, b) => a.institution.id - b.institution.id);

    return { match: sortedMatch, unmatch: sortedUnmatch };
  }, [data]);

  // --- Konfigurasi Summary Banner ---
  const summaryMap = {
    A: {
      title: "Grade A: Excellent Data",
      description: "This data is clean and highly consistent with the master data.",
      color: "green",
    },
    B: {
      title: "Focus on Grade B: Inconsistent Data",
      description: "This data has a valid NIK but some other fields are null or inconsistent.",
      color: "yellow",
    },
    C: {
      title: "Focus on Grade C: Missing NIK",
      description: "This data is missing NIK but other fields are complete.",
      color: "orange",
    },
    D: {
      title: "Focus on Grade D: Incomplete Data",
      description: "This data is missing NIK and other key variables.",
      color: "orange",
    },
    E: {
      title: "Focus on Grade E: High Anomaly",
      description: "This data contains typos or non-standard formats.",
      color: "red",
    },
  };

  const summary = summaryMap[statusGrade];
  const colorClassMap = {
    green: {
      bg: "bg-green-50",
      border: "border-green-500",
      title: "text-green-800",
      desc: "text-green-700",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-500",
      title: "text-red-800",
      desc: "text-red-700",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-500",
      title: "text-orange-800",
      desc: "text-orange-700",
    },
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      title: "text-yellow-800",
      desc: "text-yellow-700",
    },
  };
  const color = colorClassMap[summary?.color];
  // ----------------------------------

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="font-medium animate-pulse text-blue-600">Loading preview data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center text-red-500 font-medium bg-red-50 p-6 rounded-lg mt-6">
        Failed to load preview data. Please check your connection or API.
      </div>
    );
  }

  const matchedInstitution = sortedData.match.map((item) => item.institution);
  const matchedMaster = sortedData.match.map((item) => item.master).filter(Boolean);
  const unmatchedInstitution = sortedData.unmatch.map((item) => item.institution);

  return (
    <div>
      <button
        onClick={() => navigate(-1)} 
        className="flex items-center text-sm text-blue-600 hover:underline mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Batch List
      </button>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-gray-800">
          Matched Data: {institutionName}
        </h2>
      </div>

      {/* Render Banner Disini */}
      {summary && (
        <div
          className={`${color?.bg} border-l-4 ${color?.border} p-4 rounded-r-lg mb-6`}
        >
          <h4 className={`font-bold ${color?.title}`}>{summary.title}</h4>
          <p className={`text-sm mt-1 ${color?.desc}`}>{summary.description}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Matched Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-600 mb-2">Source Data (from Institution)</h4>
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[40vh] custom-scrollbar">
                  <TableHeader
                    data={matchedInstitution}
                    type="preview_institution"
                    selectionType="none"
                    grade={statusGrade}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-600 mb-2">Matched Data (from DUKCAPIL)</h4>
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[40vh] custom-scrollbar">
                  <TableHeader
                    data={matchedMaster}
                    type="preview_master"
                    selectionType="none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Unmatched Records</h3>
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[40vh] custom-scrollbar">
              <TableHeader
                data={unmatchedInstitution}
                type="preview"
                selectionType="none"
                grade={statusGrade}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;