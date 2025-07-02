import { ArrowLeft, Loader2, CircleCheck } from "lucide-react";
import TableHeader from "./TableHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DangerPopOut from "../../../components/PopOut/DangerPopOut";
import { SuccessPopOut } from "../../../components/PopOut/SuccessPopOut";
import useGetInvestigationData from "../hooks/useGetDataInvestigate";
import usePostMatchData from "../hooks/usePostMatchData";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../../axios/axiosInstance";

const InvestigatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { metadata_id, institutionName, statusGrade } = location.state || {};

  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(null);
  const [loadingOverlay, setLoadingOverlay] = useState(false);

  const { data, isLoading, error } = useGetInvestigationData(metadata_id);
  const { mutateAsync: postMatchData } = usePostMatchData(metadata_id);

  const [sortedData, setSortedData] = useState([]);

  useEffect(() => {
    if (!data) return;

    const hasReasonInSimilarity = (entry) =>
      (entry.similiarity_data || []).some((item) => !!item.reason);

    const sorted = [...data].sort((a, b) => {
      const aHas = hasReasonInSimilarity(a);
      const bHas = hasReasonInSimilarity(b);
      return bHas - aHas;
    });

    setSortedData(sorted);
  }, [data]);

  useEffect(() => {
  if (!sortedData) return;

  const sortByReason = (a, b) => {
    const aHasReason = !!a.reason;
    const bHasReason = !!b.reason;
    return bHasReason - aHasReason;
  };

  if (selectedIndexes.length === 0) {
    const allMatches = sortedData.flatMap((d) => d.similiarity_data || []);
    const sortedMatches = [...allMatches].sort(sortByReason);
    setSelectedMatches(sortedMatches);
  } else {
    const filtered = selectedIndexes.flatMap(
      (i) => sortedData[i]?.similiarity_data || []
    );
    const sortedFiltered = [...filtered].sort(sortByReason);
    setSelectedMatches(sortedFiltered);
  }
}, [sortedData, selectedIndexes]);


  useEffect(() => {
    if (!data) return;

    if (selectedIndexes.length === 0) {
      const allMatches = data.flatMap((d) => d.similiarity_data || []);
      setSelectedMatches(allMatches);
    } else {
      const filtered = selectedIndexes.flatMap(
        (i) => data[i]?.similiarity_data || []
      );
      setSelectedMatches(filtered);
    }
  }, [data, selectedIndexes]);

  useEffect(() => {
    setSelectedMatchIndex(null);
  }, [selectedIndexes]);

  const selectedSource =
    selectedIndexes.length === 1 ? sortedData[selectedIndexes[0]] : null;
  const similarityData = selectedSource?.similiarity_data || [];
  const isMatchButtonDisabled =
    selectedIndexes.length !== 1 ||
    selectedMatchIndex === null ||
    loadingOverlay;

  const shouldShowMatchReason =
    selectedSource &&
    (similarityData.length === 1 ||
      (similarityData.length > 1 && selectedMatchIndex != null));

  const handleMarkAsMatch = async () => {
    if (isMatchButtonDisabled || !selectedSource) return;
    const selected = similarityData[selectedMatchIndex];

    setLoadingOverlay(true);
    try {
      await postMatchData({
        institution_id: selectedSource.id.toString(),
        nik: selected.nik,
        match_type: "match",
      });
    } finally {
      setLoadingOverlay(false);
    }
  };

  const handleMarkAsUnmatch = async () => {
    if (isMatchButtonDisabled || !selectedSource) return;
    const selected = similarityData[selectedMatchIndex];

    setLoadingOverlay(true);
    try {
      await postMatchData({
        institution_id: selectedSource.id.toString(),
        nik: selected.nik,
        match_type: "unmatch",
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
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
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
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CircleCheck className="w-4 h-4 mr-2" />}
          {isPending ? 'Processing...' : 'Mark as Completed'}
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
                  // data={data}
                  data={Array.isArray(sortedData) ? sortedData : []}
                  type="investigate"
                  selectionType="radio"
                  grade={statusGrade}
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
                onClick={handleMarkAsUnmatch}
              >
                Mark as Unmatch
              </button>
            </div>
          </div>

          {/* Potential Matches */}
          <div>
            <h3 className="font-semibold text-lg mb-2">
              Potential Matches (from DUKCAPIL)
            </h3>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[40vh]">
                <TableHeader
                  // data={selectedMatches.map(({ reason, ...rest }) => rest)}
                  data={Array.isArray(selectedMatches) ? selectedMatches.map(({ reason, ...rest }) => rest) : []}
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
                <h4 className="font-semibold text-blue-800">Match Reason</h4>
                <p className="text-sm text-slate-700 mt-1">
                  {selectedMatchIndex != null
                    ? similarityData[selectedMatchIndex]?.reason
                    : similarityData[0]?.reason}
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
                onClick={handleMarkAsMatch}
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
