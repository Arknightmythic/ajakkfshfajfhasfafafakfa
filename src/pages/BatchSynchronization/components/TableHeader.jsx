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
      "nama_lengkap",
      "tempat_lahir",
      "tanggal_lahir",
      "nama_ibu",
      "provinsi",
      "kabupaten",
      "kecamatan",
      "kelurahan",
      "status_kematian",
      "match_score",
    ],
  };

  const rawKeys = Object.keys(data[0]);

  const prefixMap = {
    investigate: "institution_",
    matches: "master_",
  };

  const prefix = prefixMap[type] || "";

  const baseColumns = grade
    ? gradeColumnsMap[grade.toUpperCase()] ?? []
    : rawKeys.map((key) => key.replace(prefix, ""));

  // let headers = baseColumns
  //   .map((col) => `${prefix}${col}`)
  //   .filter((key) => rawKeys.includes(key));

  let headers = baseColumns
    .map((col) => `${prefix}${col}`)
    .filter((key) => {
      if (type === "preview") return key !== "nama" && rawKeys.includes(key);
      return rawKeys.includes(key);
    });


  if (type === "matches") {
    headers = headers.filter(
      (key) =>
        !key.endsWith("id") && key !== "master_nama"
    );
    if (rawKeys.includes("reason")) {
      headers.push("reason");
    }
  }


  return (
    <table className="w-full text-sm text-left">
      <thead className="text-xs text-slate-500 uppercase bg-slate-50">
        <tr>
          {selectionType === "radio" && type !== "preview" && (
            <th className="p-2 w-10 sticky left-0 bg-slate-50"></th>
          )}
          {headers.map((key) => (
            <th key={key} className="px-6 py-3">
              {key
                .replace(prefix, "")
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </th>
          ))}
        </tr>

      </thead>
      <tbody>
        {data.map((item, idx) => {
          const isChecked =
            selectionType === "checkbox"
              ? selectedIndexes.includes(idx)
              : selectedRadioIndex === idx;

          return (
            <tr key={idx} className="border-b border-slate-200 hover:bg-slate-100">
              {selectionType === "radio" && type !== "preview" && (
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
                  {key === `${prefix}match_score` && typeof item[key] === "number"
                    ? `${(item[key] * 100).toFixed(2)}%`
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
