import { ArrowLeft } from "lucide-react";
import TableHeader from "./TableHeader";
import { useLocation, useNavigate } from "react-router-dom";

const PreviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    institutionName = "State Civil Service Agency",
    matchedSourceData = [],
    matchedDukcapilData = [],
    unmatchedSourceData = [],
  } = location.state || {};
  return (
    <div >
      <button
        onClick={() => navigate(-1)} 
        className="flex items-center text-sm text-blue-600 hover:underline mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Batch List
      </button>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-2xl font-bold">
          Matched Data: {institutionName}
        </h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Matched Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-600 mb-2">Source Data (from Institution)</h4>
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[40vh]">
                  <TableHeader data={matchedSourceData} />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-600 mb-2">Matched Data (from DUKCAPIL)</h4>
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[40vh]">
                  <TableHeader data={matchedDukcapilData} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <h3 className="font-semibold text-lg mb-2">Unmatched Records</h3>
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[40vh]">
              <TableHeader data={unmatchedSourceData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
