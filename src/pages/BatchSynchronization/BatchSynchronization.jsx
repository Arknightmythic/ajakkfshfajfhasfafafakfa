import { useState } from "react";
import { Search } from "lucide-react";
import PreviewPage from "./components/PreviewPage";
import { useNavigate } from "react-router-dom";

const BatchSynchronization = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState("list");
  const [selectedPreviewData, setSelectedPreviewData] = useState({
    matchedSourceData: [],
    matchedDukcapilData: [],
    unmatchedSourceData: [],
  });

  const navigate = useNavigate();
  const data = [
    {
      metadata_id: "1",
      name: "Ministry of Social Affairs",
      total: "150,000",
      grade: "E",
      status: "Awaiting Action",
    },
    {
      metadata_id: "2",
      name: "Ministry of Health",
      total: "2,500,000",
      grade: "E",
      status: "In Progress",
    },
    {
      metadata_id: "3",
      name: "Ministry of Finance",
      total: "25,000",
      grade: "B",
      status: "Awaiting Action",
    },
    {
      metadata_id: "4",
      name: "Ministry of Education",
      total: "12,000",
      grade: "C",
      status: "Awaiting Action",
    },
    {
      metadata_id: "4",
      name: "State Civil Service Agency",
      total: "75,000",
      grade: "A",
      status: "Completed",
    },
  ];

  const gradeColor = {
    A: "bg-green-200 text-green-800",
    B: "bg-yellow-200 text-yellow-800",
    C: "bg-orange-200 text-orange-800",
    D: "bg-red-300 text-red-900",
    E: "bg-red-200 text-red-800",
  };

  const statusColor = {
    "Awaiting Action": "bg-red-100 text-red-800",
    "In Progress": "bg-orange-100 text-orange-800",
    "Completed": "bg-green-100 text-green-800",
  };

  const filteredData = data.filter((item) => {
    const matchSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchGrade = gradeFilter ? item.grade === gradeFilter : true;
    const matchStatus = statusFilter ? item.status === statusFilter : true;
    return matchSearch && matchGrade && matchStatus;
  });

  const showInvestigationPage = (id, name, grade) => {
    navigate('/batch-synchronization/investigate', {
      state: {
        metadata_id: id,
        institutionName: name,
        statusGrade: grade,
        data: [
          {
            institution_id: "12324",
            name: "TIMOTHY",
            birthdate: "09-09-1999",
            similiarity_data: [
              { nik: "digidaw", name: "TIMOTHY r", reason: "lorem ipsum" },
              { nik: "digidaw3", name: "TMOMOTH", reason: "lorem ipsum2" },
            ],
          },
          {
            institution_id: "0000",
            name: "KALIMASADA",
            birthdate: "09-09-1999",
            similiarity_data: [
              { nik: "00000", name: "KALIMASADA", reason: "lorem ipsum" },
              { nik: "000000", name: "KALISAMADA", reason: "lorem ipsum3" },
            ],
          },
        ],
      },
    });

    console.log("masuk")
  };

  const showMatchedPage = (name, grade) => {
    navigate('/batch-synchronization/preview', {
      state: {
        institutionName: name,
        matchedSourceData: [
          { nik: "1234123412341234", nama: "Kalimasada", tempat_lahir: "Pondok Indah Mall", tanggal_lahir: "09-09-1999", nama_ibu: "Putri" },
          { nik: "9999888877776666", nama: "Timothy Ronald", tempat_lahir: "Pantai Indah Kapuk", tanggal_lahir: "09-09-1999", nama_ibu: "Liliana" },
        ],
        matchedDukcapilData: [
          { nik: "1234123412341234", nama: "Kalimasada", tempat_lahir: "Pondok Indah Mall", tanggal_lahir: "09-09-1999", nama_ibu: "Putri" },
          { nik: "9999888877776666", nama: "Timothy Ronald", tempat_lahir: "Pantai Indah Kapuk", tanggal_lahir: "09-09-1999", nama_ibu: "Liliana" },
        ],
        unmatchedSourceData: [
          { nik: "6666666666666666", nama: "Wijaya", tempat_lahir: "Central Park", tanggal_lahir: "09-09-2000", nama_ibu: "Olivia" },
        ],
      }
    });
    console.log("masuk")
  };



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
              <option value="">All Grades</option>
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
              <option value="">All Statuses</option>
              {["Awaiting Action", "In Progress", "Completed"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
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
                {filteredData.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4">{item.total}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`${gradeColor[item.grade]} font-bold text-xs px-2 py-1 rounded`}
                      >
                        Grade {item.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`${statusColor[item.status]} text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.status === "Completed" || item.status === "In Progress" ? (
                          <button
                            onClick={() => {
                              if (item.status === "Completed") {
                                showMatchedPage(item.name, item.grade);
                              }
                            }}
                            disabled={item.status === "In Progress"}
                            className={`font-medium ${
                              item.status === "In Progress"
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-blue-600 hover:underline cursor-pointer"
                            }`}
                          >
                            Preview
                          </button>
                      ) : (
                        <button
                          onClick={() => showInvestigationPage(item.metadata_id, item.name, item.grade)}
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
      )}

    </div>
  );
};

export default BatchSynchronization;
