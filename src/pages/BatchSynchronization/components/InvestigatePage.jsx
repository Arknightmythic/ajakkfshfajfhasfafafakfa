import { ArrowLeft, Loader2, CircleCheck } from "lucide-react";
import TableHeader from "./TableHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import DangerPopOut from "../../../components/PopOut/DangerPopOut";
import { SuccessPopOut } from "../../../components/PopOut/SuccessPopOut";
import useGetInvestigationData from "../hooks/useGetDataInvestigate";
import usePostMatchData from "../hooks/usePostMatchData";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../../axios/axiosInstance";
import { Sparkles } from 'lucide-react';

const InvestigatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { metadata_id, institutionName, statusGrade } = location.state || {};

  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(null);
  const [loadingOverlay, setLoadingOverlay] = useState(false);

  const { data, isLoading, error } = useGetInvestigationData(metadata_id);
  const { mutateAsync: postMatchData } = usePostMatchData(metadata_id);

  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const aHas = !!a.pivot_reason;
      const bHas = !!b.pivot_reason;
      return bHas - aHas;
    });
  }, [data]);

  console.log("sorted data", sortedData)

  useEffect(() => {
    if (sortedData && sortedData.length > 0) {
      const problematicIndex = sortedData.findIndex(item => item === null || item === undefined);
      
      if (problematicIndex > -1) {
        console.error(`DITEMUKAN! Ada item null/undefined di dalam 'sortedData' pada index: ${problematicIndex}`);
      } else {
        console.log("Pemeriksaan selesai: Tidak ada item null/undefined di tingkat atas array 'sortedData'.");
      }
    }
  }, [sortedData]); 

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
      await postMatchData({
        institution_id: selected.pivot_institution_id.toString(),
        nik: selected.master_nik,
        match_type: type,
      });
    } finally {
      setLoadingOverlay(false);
    }
  };

  const { mutate: markAsDone, isPending } = useMutation({
    mutationFn: async () => {
      await axiosInstance.general.post(`/sync/mark-as-done/${metadata_id}`);
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

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <p className="font-medium animate-pulse">Loading data...</p>
      </div>
    );
  }

  if (error || !data) {
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
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-30 flex items-center justify-center rounded-lg">
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

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
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

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">
              Source Data (from Institution)
            </h3>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[40vh]">
                <TableHeader
                  data={sortedData.filter(Boolean).map((d) => ({
                    ...Object.fromEntries(
                      Object.entries(d).filter(([key]) =>
                        key.startsWith("institution_")
                      )
                    ),
                  }))}
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
                className={`px-4 py-2 rounded-md text-sm ${
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

          <div>
            <h3 className="font-semibold text-lg mb-2">
              Potential Matches (from DUKCAPIL)
            </h3>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[40vh]">
                <TableHeader
                  data={selectedMatches.filter(Boolean).map((d) => ({
                    ...Object.fromEntries(
                      Object.entries(d).filter(([key]) =>
                        key.startsWith("master_")
                      )
                    ),
                  }))}
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
                    ? selectedMatches[selectedMatchIndex]?.pivot_reason
                    : selectedMatches[0]?.pivot_reason}
                </p>
              </div>
            )}
            <div className="mt-4 text-right">
              <button
                className={`px-4 py-2 rounded-md text-sm ${
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
      </div>
    </div>
  );
};

export default InvestigatePage;
