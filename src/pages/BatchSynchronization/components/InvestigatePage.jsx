import { ArrowLeft } from "lucide-react";
import TableHeader from "./TableHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { CircleCheck } from 'lucide-react';
import { useEffect, useState } from "react";

const InvestigatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { institutionName, statusGrade, data = [] } = location.state || {};
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(null);
  const selectedSource = selectedIndexes.length === 1 ? data[selectedIndexes[0]] : null;
  const similarityData = selectedSource?.similiarity_data || [];
  const isMatchButtonDisabled = selectedIndexes.length !== 1 || selectedMatchIndex === null;


  const shouldShowMatchReason =
    selectedSource &&
    (
      similarityData.length === 1 ||
      (similarityData.length > 1 && selectedMatchIndex != null)
    );

  useEffect(() => {
    if (data.length > 0 && selectedIndexes.length === 0) {
      const allMatches = data.flatMap((d) => d.similiarity_data || []);
      setSelectedMatches(allMatches);
    }
  }, [data, selectedIndexes]);

  useEffect(() => {
    if (selectedIndexes.length > 0) {
      const filtered = selectedIndexes.flatMap(
        (i) => data[i]?.similiarity_data || []
      );
      setSelectedMatches(filtered);
    }
  }, [selectedIndexes]);

  useEffect(() => {
    setSelectedMatchIndex(null);
  }, [selectedIndexes]);



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

  const handleMarkAsMatch = () => {
    if (!selectedSource) return;

    const simData = selectedSource.similiarity_data || [];

    const result = simData.map((item, idx) => ({
      institution_id: selectedSource.institution_id,
      nik: item.nik,
      is_match: idx === selectedMatchIndex ? 1 : 0,
    }));

    console.log(result);
  };

  const handleMarkAsUnmatch = () => {
    if (!selectedSource) return;

    const simData = selectedSource.similiarity_data || [];
    const result = {
      institution_id: selectedSource.institution_id,
      nik: simData[selectedMatchIndex]?.nik,
      is_match: 0,
    };

    console.log(result);
  };


  return (
    <div >
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)} 
          className="flex items-center text-sm text-blue-600 hover:underline mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Batch List
        </button>

        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm flex items-center cursor-pointer">
            <CircleCheck className="w-4 h-4 mr-2"/>
            Mark as Completed
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-2xl font-bold">
          Investigating: {institutionName}
        </h2>
      </div>

      {summary && (
        <div className={`${color?.bg} border-l-4 ${color?.border} p-4 rounded-r-lg mb-6`}>
          <h4 className={`font-bold ${color?.title}`}>{summary.title}</h4>
          <p className={`text-sm mt-1 ${color?.desc}`}>{summary.description}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Source Data (from Institution)</h3>
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[40vh]">
                  <TableHeader
                    data={data}
                    type="investigate"
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
                onClick={handleMarkAsUnmatch}
              >
                Mark as Unmatch
              </button>

            </div>

            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Potential Matches (from DUKCAPIL)</h3>
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[40vh]">
                  <TableHeader
                    data={selectedMatches.map(({ reason, ...rest }) => rest)}
                    type="investigate"
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
                    {
                      selectedMatchIndex != null
                        ? similarityData[selectedMatchIndex]?.reason
                        : similarityData[0]?.reason
                    }
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
    </div>
  );
};

export default InvestigatePage;