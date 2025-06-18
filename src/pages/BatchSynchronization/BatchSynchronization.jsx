import { useState } from "react";
import { Search } from "lucide-react";

const BatchSynchronization = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const data = [
    {
      name: "Ministry of Social Affairs",
      total: "150,000",
      grade: "E",
      status: "Awaiting Action",
    },
    {
      name: "Ministry of Health",
      total: "2,500,000",
      grade: "E",
      status: "In Progress",
    },
    {
      name: "Ministry of Finance",
      total: "25,000",
      grade: "B",
      status: "Awaiting Action",
    },
    {
      name: "Ministry of Education",
      total: "12,000",
      grade: "C",
      status: "Awaiting Action",
    },
    {
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

  const showInvestigationPage = (name, grade) => {
    console.log("Investigate:", name, grade);
  };

  const showMatchedPage = (name, grade) => {
    console.log("View matched:", name, grade);
  };

  return (
    <div>
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
                    {item.status === "Completed" ? (
                      <button
                        onClick={() => showMatchedPage(item.name, item.grade)}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        View
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          showInvestigationPage(item.name, item.grade)
                        }
                        className="font-medium text-blue-600 hover:underline"
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
  );
};

export default BatchSynchronization;
