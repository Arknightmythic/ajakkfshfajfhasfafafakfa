const TableHeader = ({
  data,
  type = "default",
  grade,
  selectionType = "radio",
  selectedRadioIndex,
  onRadioChange,
  radioGroupName = "default-group",
}) => {
  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-500 px-2 py-3">No data available.</p>;
  }

  const gradeColumnsMap = {
    A: ["nik", "nama_lengkap", "tempat_lahir", "tanggal_lahir", "jenis_kelamin", "nama_ibu", "match_score"],
    B: ["nik", "nama_lengkap", "tempat_lahir", "tanggal_lahir", "jenis_kelamin", "nama_ibu", "match_score"],
    C: ["nama_lengkap", "tempat_lahir", "tanggal_lahir", "jenis_kelamin", "nama_ibu", "match_score"],
    D: ["nama_lengkap", "tempat_lahir", "tanggal_lahir", "jenis_kelamin", "nama_ibu", "match_score"],
    E: [
      "nama_lengkap", "tempat_lahir", "tanggal_lahir", "nama_ibu", "provinsi",
      "kabupaten", "kecamatan", "kelurahan", "status_kematian", "match_score",
    ],
  };

  const rawKeys = Object.keys(data[0]);

  // --- PERUBAHAN 1: Koreksi prefix untuk master preview ---
  const prefixMap = {
    investigate: "institution_",
    matches: "master_",
    preview_institution: "institution_",
    preview_master: "", // Master preview tidak memiliki prefix
  };
  
  const prefix = prefixMap[type] || "";

  const baseColumns = grade
    ? gradeColumnsMap[grade.toUpperCase()] ?? []
    : rawKeys.map((key) => key.replace(prefix, ""));

  let headers = baseColumns
    .map(col => {
      const prefixedKey = `${prefix}${col}`;
      if (rawKeys.includes(prefixedKey)) {
        return prefixedKey;
      }
      if (rawKeys.includes(col)) {
        return col;
      }
      return null;
    })
    .filter(key => key !== null);

  if (type === "matches" || type === "preview_master") {
    // --- PERUBAHAN 2: Buat filter lebih fleksibel ---
    headers = headers.filter(
      (key) => !key.endsWith("id") && key !== "master_nama" && key !== "nama"
    );
    if (rawKeys.includes("reason")) {
      headers.push("reason");
    }
  }

  return (
    <table className="w-full text-sm text-left">
      <thead className="text-xs text-slate-500 uppercase bg-slate-50">
        <tr>
          {selectionType === "radio" && !type.startsWith("preview") && (
            <th className="p-2 w-10 sticky left-0 bg-slate-50"></th>
          )}
          {headers.map((key) => (
            <th key={key} className="px-6 py-3">
              {key
                .replace(key.startsWith(prefix) && prefix ? prefix : "", "")
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, idx) => {
          return (
            <tr key={idx} className="border-b border-slate-200 hover:bg-slate-100">
              {selectionType === "radio" && !type.startsWith("preview") && (
                <td className="p-2 w-10 sticky left-0 bg-white">
                  <input
                    type="radio"
                    name={radioGroupName}
                    checked={selectedRadioIndex === idx}
                    onChange={() => onRadioChange?.(idx)}
                    className="rounded border-slate-300"
                  />
                </td>
              )}
              {headers.map((key) => (
                <td
                  key={key}
                  className={`px-6 py-2 ${
                    key.includes("nama_lengkap") ? "font-semibold text-[#1E293B]" : ""
                  }`}
                >
                  {(key === "institution_match_score" || key === "master_match_score" || key === "match_score") && typeof item[key] === "number"
                    ? `${(item[key]).toFixed(2)}%`
                    : item[key]}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TableHeader;