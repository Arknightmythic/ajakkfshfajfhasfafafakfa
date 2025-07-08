import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import PreviewPage from "./components/PreviewPage";
import { useNavigate } from "react-router-dom";
import useGetData from "../BatchSynchronization/hooks/useGetData";

const BatchSynchronization = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, loading, error, refetch } = useGetData();


  const [currentPage, setCurrentPage] = useState("list");

  const navigate = useNavigate();

  const gradeColor = {
    A: "bg-green-200 text-green-800",
    B: "bg-yellow-200 text-yellow-800",
    C: "bg-orange-200 text-orange-800",
    D: "bg-purple-200 text-purple-800",
    E: "bg-red-200 text-red-800",
  };

  const statusColor = {
    "awaiting action": "bg-red-100 text-red-800",
    "in progress": "bg-orange-100 text-orange-800",
    "completed": "bg-green-100 text-green-800",
  };


    const [filteredData, setFilteredData] = useState([]);
    useEffect(() => {
      if (!data || data.length === 0) {
        setFilteredData([]);
        return;
      }

      const search = searchTerm.toLowerCase();

      const filtered = data.filter((item) => {
        const matchesSearch = item.institution_name?.toLowerCase().includes(search);
        const matchesGrade = gradeFilter.toLowerCase() ? item.grade.toLowerCase() === gradeFilter.toLowerCase() : true;
        const matchesStatus = statusFilter.toLowerCase() ? item.status_proses.toLowerCase() === statusFilter.toLowerCase() : true;

        return matchesSearch && matchesGrade && matchesStatus;
      });

      setFilteredData(filtered);
    }, [searchTerm, gradeFilter, statusFilter, data]);



  const showInvestigationPage = (id, name, grade) => {
    navigate('/batch-synchronization/investigate', {
      state: {
        metadata_id: id,
        institutionName: name,
        statusGrade: grade
      },
    });

  };

  const showMatchedPage = (id, name, grade) => {
    navigate('/batch-synchronization/preview', {
      state: {
        metadata_id: id,
        institutionName: name,
        statusGrade: grade
      }
    });
  };

  const toTitleCase = (text) =>
  text
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

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
          <p className='text-red-600 mt-1'>{error.message || "Unknown error occurred."}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {currentPage === "list" && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by Ministry/Institution..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-2 border border-slate-300 rounded-md text-sm w-full sm:w-72"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            <select
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="">All Grade</option>
              {["A", "B", "C", "D", "E"].map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
            <select
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="">All Status</option>
              {["Awaiting Action", "In Progress", "Completed"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-6 py-3">Ministry/Institution</th>
                    <th className="px-6 py-3">Total Records</th>
                    <th className="px-6 py-3">Grade</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredData]
                  .sort((a, b) => new Date(b.inserted_date) - new Date(a.inserted_date))
                  .map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 font-medium">{item.institution_name}</td>
                      <td className="px-6 py-4">{new Intl.NumberFormat('id-ID').format(item.total_records)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`${gradeColor[item.grade]} font-bold text-xs px-2 py-1 rounded`}
                        >
                          Grade {item.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`${statusColor[item.status_proses.toLowerCase()]} text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full`}
                        >
                          {toTitleCase(item.status_proses)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.status_proses.toLowerCase() === "completed" || item.status_proses.toLowerCase() === "in progress" ? (
                            <button
                              onClick={() => {
                                if (item.status_proses.toLowerCase() === "completed") {
                                  showMatchedPage(item.id, item.institution_name, item.grade);
                                }
                              }}
                              disabled={item.status_proses.toLowerCase() === "in progress"}
                              className={`font-medium ${
                                item.status_proses.toLowerCase() === "in progress"
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-blue-600 hover:underline cursor-pointer"
                              }`}
                            >
                              Preview
                            </button>
                        ) : (
                          <button
                            onClick={() => showInvestigationPage(item.id, item.institution_name, item.grade)}
                            className="font-medium text-blue-600 hover:underline cursor-pointer"
                          >
                            Investigate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                        No data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BatchSynchronization;
