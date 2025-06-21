const TableHeader = ({
  data,
  type = "default",
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

  const headers =
    type === "investigate"
      ? Object.keys(data[0]).filter((k) => k !== "institution_id" && k !== "similiarity_data")
      : Object.keys(data[0]);

  return (
    <table className="w-full text-sm text-left">
      <thead className="text-xs text-slate-500 uppercase bg-slate-50">
        <tr>
          {type === "investigate" && (
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
              {type === "investigate" && (
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
                <td key={key} className="px-6 py-2">
                  {item[key]}
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
