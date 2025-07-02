const TableHeader = ({
  data,
  type = "default",
  grade,
  selectionType = "checkbox",
  selectedIndexes = [],
  selectedRadioIndex,
  onCheckboxToggle,
  onCheckboxToggleAll,
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
      "match_score"
    ],
  };

  const rawKeys = Object.keys(data[0]);

  const headers =
    grade
      ? gradeColumnsMap[grade.toUpperCase()]?.filter((k) => rawKeys.includes(k)) ?? []
      : type === "investigate"
      ? rawKeys.filter((k) => k !== "institution_id" && k !== "similiarity_data")
      : rawKeys.filter((k) => k !== "id" && k !== "nama");


  return (
    <table className="w-full text-sm text-left">
      <thead className="text-xs text-slate-500 uppercase bg-slate-50">
        <tr>
          {(selectionType === "checkbox" || selectionType === "radio") && (
            <th className="p-2 w-10 sticky left-0 bg-slate-50">
              {selectionType === "checkbox" && (
                <input
                  type="checkbox"
                  className="rounded border-slate-300"
                  onChange={(e) => onCheckboxToggleAll?.(e.target.checked)}
                  checked={selectedIndexes.length === data.length}
                />
              )}
            </th>
          )}
          {headers.map((key) => (
            <th key={key} className="px-6 py-3">
              {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
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
              {(selectionType === "checkbox" || selectionType === "radio") && (
                <td className="p-2 w-10 sticky left-0 bg-white">
                  <input
                    type={selectionType}
                    name={radioGroupName}
                    checked={isChecked}
                    onChange={() =>
                      selectionType === "checkbox"
                        ? onCheckboxToggle?.(idx)
                        : onRadioChange?.(idx)
                    }
                    className="rounded border-slate-300"
                  />
                </td>
              )}
              {headers.map((key) => (
                <td
                key={key}
                className={`px-6 py-2 ${key === "nama_lengkap" ? "font-semibold text-[#1E293B]" : ""}`}
              >
                {key === "match_score"
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
