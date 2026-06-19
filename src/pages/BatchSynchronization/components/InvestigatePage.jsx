import { ArrowLeft, Loader2, CircleCheck, Sparkles } from "lucide-react";
import TableHeader from "./TableHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import DangerPopOut from "../../../components/PopOut/DangerPopOut";
import { SuccessPopOut } from "../../../components/PopOut/SuccessPopOut";
import useGetInvestigationData from "../hooks/useGetDataInvestigate";
import usePostMatchData from "../hooks/usePostMatchData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../axios/axiosInstance";

const InvestigatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Alias metadata_id menjadi file_id agar konsisten dengan payload API
  const { metadata_id: file_id, institutionName, statusGrade } = location.state || {};
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(null);
  const [loadingOverlay, setLoadingOverlay] = useState(false);

  // Fetch API dengan parameter page
  const { data: responseData, isLoading, error } = useGetInvestigationData(file_id, page);
  const { mutateAsync: postMatchData } = usePostMatchData();

  // PERBAIKAN: Bungkus dataList dengan useMemo agar referensi memori stabil
  const dataList = useMemo(() => responseData?.data || [], [responseData?.data]);
  
  // Ekstrak metadata pagination
  const totalRows = responseData?.total_rows || 0;
  const totalPages = responseData?.total_pages || 1;
  const hasNext = responseData?.has_next || false;
  const hasPrev = responseData?.has_prev || false;

  const sortedData = useMemo(() => {
    if (!dataList || dataList.length === 0) return [];
    return [...dataList].sort((a, b) => {
      const aHas = !!a.institution?.reason;
      const bHas = !!b.institution?.reason;
      return bHas - aHas;
    });
  }, [dataList]); // <-- Sekarang dependency ini sudah aman

  const selectedMatches = useMemo(() => {
    if (selectedIndexes.length === 0) return sortedData;
    return selectedIndexes.map((idx) => sortedData[idx]);
  }, [sortedData, selectedIndexes]);

  useEffect(() => {
    setSelectedMatchIndex(null);
  }, [selectedIndexes]);

  const selectedSource =
    selectedIndexes.length === 1 ? sortedData[selectedIndexes[0]] : null;

  const isMatchButtonDisabled =
    selectedIndexes.length !== 1 ||
    selectedMatchIndex === null ||
    loadingOverlay;

  const shouldShowMatchReason =
    selectedSource &&
    (selectedMatches.length === 1 ||
      (selectedMatches.length > 1 && selectedMatchIndex != null));

  const handleMark = async (type) => {
    if (isMatchButtonDisabled || !selectedSource) return;
    const selected = selectedMatches[selectedMatchIndex];
    setLoadingOverlay(true);
    
    try {
      // Menentukan match_status: 4 untuk manual match, 5 untuk manual unmatch
      const statusValue = type === "match" ? 4 : 5;

      await postMatchData({
        file_id: file_id,
        id_incoming: selected.institution.id.toString(), // id_incoming dari sisi institution
        match_status: statusValue,
      });
      
      // Reset seleksi setelah sukses dan refetch data
      setSelectedIndexes([]);
      setSelectedMatchIndex(null);
      queryClient.invalidateQueries(["investigation", file_id, page]);
    } finally {
      setLoadingOverlay(false);
    }
  };

  const { mutate: markAsDone, isPending } = useMutation({
    mutationFn: async () => {
      // Menggunakan endpoint PATCH API terbaru untuk mark as completed
      await axiosInstance.general.patch(`/mark-as-completed/files/${file_id}`);
    },
    onSuccess: () => {
      SuccessPopOut(
        "Success",
        "success",
        "Investigation marked as completed successfully."
      ).then(() => navigate("/batch-synchronization"));
    },
  });

  const summaryMap = {
    E: {
      title: "Focus on Grade E: High Anomaly",
      description: "This data contains typos or non-standard formats.",
      color: "red",
    },
    D: {
      title: "Focus on Grade D: Incomplete Data",
      description: "This data is missing NIK and other key variables.",
      color: "orange",
    },
    C: {
      title: "Focus on Grade C: Missing NIK",
      description: "This data is missing NIK but other fields are complete.",
      color: "orange",
    },
    B: {
      title: "Focus on Grade B: Inconsistent Data",
      description:
        "This data has a valid NIK but some other fields are null or inconsistent.",
      color: "yellow",
    },
  };

  const summary = summaryMap[statusGrade];
  const colorClassMap = {
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

  if (isLoading && dataList.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 mx-auto mb-4 text-blue-600" />
          <p className="font-medium animate-pulse text-blue-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error || !responseData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Data</h3>
          <p className="text-red-600 mt-1">
            {error?.message || "Data not found or an unknown error occurred."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {(loadingOverlay || isPending) && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-30 flex items-center justify-center rounded-lg">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-blue-600 hover:underline mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Batch List
        </button>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm flex items-center cursor-pointer"
          onClick={() =>
            DangerPopOut(
              "Mark as Completed?",
              `All source data that has not been marked as <b>Match</b> or <b>Unmatch</b> will automatically be marked as <b>Unmatch</b>. Are you sure you want to proceed?`,
              "Yes, mark as completed",
              () => markAsDone()
            )
          }
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CircleCheck className="w-4 h-4 mr-2" />
          )}
          {isPending ? "Processing..." : "Mark as Completed"}
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-slate-200">
        <h2 className="text-2xl font-bold">Investigating: {institutionName}</h2>
      </div>

      {summary && (
        <div
          className={`${color?.bg} border-l-4 ${color?.border} p-4 rounded-r-lg mb-6`}
        >
          <h4 className={`font-bold ${color?.title}`}>{summary.title}</h4>
          <p className={`text-sm mt-1 ${color?.desc}`}>{summary.description}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom Kiri - Source Data */}
          <div>
            <h3 className="font-semibold text-lg mb-2">
              Source Data (from Institution)
            </h3>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[40vh] custom-scrollbar">
                <TableHeader
                  data={sortedData.map((d) => d.institution)}
                  type="investigate"
                  grade={statusGrade}
                  selectionType="radio"
                  selectedRadioIndex={selectedIndexes[0] ?? null}
                  onRadioChange={(idx) => setSelectedIndexes([idx])}
                  radioGroupName="source"
                />
              </div>
            </div>
            <div className="mt-4 text-right">
              <button
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  isMatchButtonDisabled
                    ? "bg-red-300 text-white cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                }`}
                disabled={isMatchButtonDisabled}
                onClick={() => handleMark("unmatch")}
              >
                Mark as Unmatch
              </button>
            </div>
          </div>

          {/* Kolom Kanan - Potential Matches */}
          <div>
            <h3 className="font-semibold text-lg mb-2">
              Potential Matches (from DUKCAPIL)
            </h3>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[40vh] custom-scrollbar">
                <TableHeader
                  data={selectedMatches.map((d) => d.master).filter(Boolean)}
                  type="matches"
                  selectionType="radio"
                  selectedRadioIndex={selectedMatchIndex}
                  onRadioChange={setSelectedMatchIndex}
                  radioGroupName="matches"
                />
              </div>
            </div>
            {shouldShowMatchReason && (
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className=" text-blue-800 animate-pulse w-4 h-4"/>
                  <h4 className="font-semibold text-blue-800">AI Insight</h4>
                </div>
                <p className="text-sm text-slate-700 mt-1">
                  {selectedMatchIndex != null
                    ? selectedMatches[selectedMatchIndex]?.institution?.reason
                    : selectedMatches[0]?.institution?.reason}
                </p>
              </div>
            )}
            <div className="mt-4 text-right">
              <button
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  isMatchButtonDisabled
                    ? "bg-blue-300 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                }`}
                disabled={isMatchButtonDisabled}
                onClick={() => handleMark("match")}
              >
                Mark as Match
              </button>
            </div>
          </div>
        </div>

        {/* --- Paginasi Footer --- */}
        {dataList.length > 0 && (
          <div className="flex justify-between items-center pt-6 mt-4 border-t border-slate-200">
            <span className="text-sm text-slate-600 font-medium">
              Showing Total: {new Intl.NumberFormat('id-ID').format(totalRows)} records
            </span>
            <div className="flex items-center gap-2 mr-7">
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

export default InvestigatePage;