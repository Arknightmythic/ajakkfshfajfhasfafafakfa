import { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, X, Plus, Trash2, Sparkles, AlertCircle } from "lucide-react";
import {
  getCustomMapping,
  saveCustomMapping,
  activateCustomMapping,
} from "../hooks/useCustomMapping";
import { ErrorPopOut } from "../../../components/PopOut/ErrorPopOut";
import { SuccessPopOut } from "../../../components/PopOut/SuccessPopOut";

// Field yang bisa dipakai sebagai blocking anchor kalau nik gak dipasangkan.
// HARUS sinkron dengan processing/custom_query_builder.py::BLOCKING_ANCHOR_FIELDS
// (+ "nik" itu sendiri, karena nik juga anchor lewat jalur exact-match).
const ANCHOR_CAPABLE_COLUMNS = [
  "nik",
  "jenis_kelamin",
  "nama_lengkap",
  "tanggal_lahir",
];

const WEIGHT_EPSILON = 0.001;

const emptyPair = () => ({ master_column: "", incoming_column: "", weight: "" });

export const CustomMappingWeightModal = ({ fileId, onClose, onSaved }) => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [masterColumns, setMasterColumns] = useState([]);
  const [incomingColumns, setIncomingColumns] = useState([]);
  const [pairs, setPairs] = useState([]);

  const [taskStatus, setTaskStatus] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadMapping = useCallback(async () => {
    try {
      const data = await getCustomMapping(fileId);
      setMasterColumns(data.master_columns || []);
      setIncomingColumns(data.incoming_columns || []);
      setTaskStatus(data.custom_mapping_task_status);
      setPairs(
        (data.pairs || []).map((p) => ({
          master_column: p.master_column,
          incoming_column: p.incoming_column,
          weight: p.weight === null || p.weight === undefined ? "" : String(p.weight),
        })),
      );
      setLoadError(null);
    } catch (err) {
      setLoadError(
        err.response?.data?.detail || "Gagal memuat data pairing.",
      );
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    if (!fileId) return;
    setLoading(true);
    loadMapping();
  }, [fileId, loadMapping]);

  // ── Polling saat AI lagi regenerate pairing ─────────────────────────────
  useEffect(() => {
    if (!regenerating) return;

    const interval = setInterval(async () => {
      try {
        const data = await getCustomMapping(fileId);
        if (data.custom_mapping_task_status === "SUCCESS") {
          setRegenerating(false);
          setMasterColumns(data.master_columns || []);
          setIncomingColumns(data.incoming_columns || []);
          setTaskStatus(data.custom_mapping_task_status);
          setPairs(
            (data.pairs || []).map((p) => ({
              master_column: p.master_column,
              incoming_column: p.incoming_column,
              weight:
                p.weight === null || p.weight === undefined
                  ? ""
                  : String(p.weight),
            })),
          );
          SuccessPopOut(
            "Selesai",
            "success",
            "AI selesai memetakan ulang kolom.",
          );
        } else if (data.custom_mapping_task_status === "FAILED") {
          setRegenerating(false);
          ErrorPopOut();
        }
      } catch {
        // biarkan interval jalan terus, sekadar gagal poll sekali gak fatal
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [regenerating, fileId]);

  const usedMasterColumns = useMemo(
    () => new Set(pairs.map((p) => p.master_column).filter(Boolean)),
    [pairs],
  );
  const usedIncomingColumns = useMemo(
    () => new Set(pairs.map((p) => p.incoming_column).filter(Boolean)),
    [pairs],
  );

  const weightSum = useMemo(
    () =>
      pairs.reduce((sum, p) => {
        if (p.master_column === "nik") return sum;
        const num = parseFloat(p.weight);
        return sum + (Number.isFinite(num) ? num : 0);
      }, 0),
    [pairs],
  );

  const hasAnchor = useMemo(
    () => pairs.some((p) => ANCHOR_CAPABLE_COLUMNS.includes(p.master_column)),
    [pairs],
  );

  const weightSumOk = Math.abs(weightSum - 1.0) < WEIGHT_EPSILON;

  const handleAddPair = () => {
    setPairs((prev) => [...prev, emptyPair()]);
  };

  const handleRemovePair = (index) => {
    setPairs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChangePair = (index, field, value) => {
    setPairs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      setFormError(null);
      await activateCustomMapping(fileId);
    } catch (err) {
      setRegenerating(false);
      setFormError(
        err.response?.data?.detail || "Gagal memulai ulang proses AI.",
      );
    }
  };

  const handleSave = async () => {
    setFormError(null);

    // ── Validasi lokal dulu (UX cepat, gak perlu round-trip kalau jelas salah) ──
    if (pairs.length === 0) {
      setFormError("Minimal harus ada 1 pairing.");
      return;
    }
    for (const p of pairs) {
      if (!p.master_column || !p.incoming_column) {
        setFormError("Semua baris pairing harus punya kolom master & incoming.");
        return;
      }
      if (p.master_column !== "nik" && p.weight === "") {
        setFormError(`Weight untuk "${p.master_column}" belum diisi.`);
        return;
      }
    }
    if (new Set(pairs.map((p) => p.master_column)).size !== pairs.length) {
      setFormError("Ada kolom master yang dipakai lebih dari sekali.");
      return;
    }
    if (new Set(pairs.map((p) => p.incoming_column)).size !== pairs.length) {
      setFormError("Ada kolom incoming yang dipakai lebih dari sekali.");
      return;
    }
    if (!hasAnchor) {
      setFormError(
        "Pairing butuh minimal 1 dari: nik, jenis_kelamin, nama_lengkap, atau tanggal_lahir.",
      );
      return;
    }
    if (!weightSumOk) {
      setFormError(
        `Total weight (di luar nik) harus = 1.0, saat ini ${weightSum.toFixed(3)}.`,
      );
      return;
    }

    const payloadPairs = pairs.map((p) => ({
      master_column: p.master_column,
      incoming_column: p.incoming_column,
      weight: p.master_column === "nik" ? 0 : parseFloat(p.weight),
    }));

    try {
      setSaving(true);
      await saveCustomMapping(fileId, payloadPairs);
      SuccessPopOut(
        "Tersimpan",
        "success",
        "Pairing & weight berhasil dikonfirmasi. File siap disinkronkan.",
      );
      if (onSaved) onSaved(fileId);
    } catch (err) {
      setFormError(
        err.response?.data?.detail || "Gagal menyimpan pairing.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!fileId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-3xl rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ maxHeight: "85vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-slate-900 font-semibold leading-none">
                Custom Field Mapping
              </h3>
              <p className="text-slate-500 text-xs mt-1 font-mono">
                ID: {fileId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p>Memuat pairing...</p>
            </div>
          ) : loadError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {loadError}
            </div>
          ) : regenerating ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
              <p>AI sedang memetakan ulang kolom...</p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4 gap-4">
                <p className="text-sm text-slate-600">
                  Cocokkan kolom pada tabel master dengan kolom di file yang
                  diupload, lalu atur bobot (weight) tiap pasangan. Total
                  weight (di luar <code className="text-xs bg-slate-100 px-1 rounded">nik</code>) harus persis{" "}
                  <strong>1.0</strong>.
                </p>
                <button
                  onClick={handleRegenerate}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-lg px-3 py-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Regenerate with AI
                </button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 uppercase px-1">
                  <div className="col-span-4">Master Column</div>
                  <div className="col-span-4">Incoming Column</div>
                  <div className="col-span-3">Weight</div>
                  <div className="col-span-1"></div>
                </div>

                {pairs.length === 0 ? (
                  <div className="text-center text-sm text-slate-400 py-8 border-2 border-dashed border-slate-200 rounded-lg">
                    Belum ada pairing. Klik &quot;Tambah Pairing&quot; di
                    bawah.
                  </div>
                ) : (
                  pairs.map((pair, index) => {
                    const isNik = pair.master_column === "nik";
                    return (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-2 items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5"
                      >
                        <select
                          className="col-span-4 text-sm bg-white border border-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={pair.master_column}
                          onChange={(e) =>
                            handleChangePair(index, "master_column", e.target.value)
                          }
                        >
                          <option value="">-- pilih --</option>
                          {masterColumns
                            .filter(
                              (c) =>
                                c === pair.master_column ||
                                !usedMasterColumns.has(c),
                            )
                            .map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                        </select>

                        <select
                          className="col-span-4 text-sm bg-white border border-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={pair.incoming_column}
                          onChange={(e) =>
                            handleChangePair(index, "incoming_column", e.target.value)
                          }
                        >
                          <option value="">-- pilih --</option>
                          {incomingColumns
                            .filter(
                              (c) =>
                                c === pair.incoming_column ||
                                !usedIncomingColumns.has(c),
                            )
                            .map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                        </select>

                        {isNik ? (
                          <div className="col-span-3 text-xs text-slate-400 italic px-2">
                            blocking only
                          </div>
                        ) : (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            placeholder="0.00"
                            className="col-span-3 text-sm bg-white border border-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={pair.weight}
                            onChange={(e) =>
                              handleChangePair(index, "weight", e.target.value)
                            }
                          />
                        )}

                        <button
                          onClick={() => handleRemovePair(index)}
                          className="col-span-1 flex justify-center text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <button
                onClick={handleAddPair}
                className="mt-3 flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                Tambah Pairing
              </button>

              <div
                className={`mt-4 flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium ${
                  weightSumOk
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <span>Total Weight (di luar nik)</span>
                <span className="font-mono font-bold">
                  {weightSum.toFixed(3)} / 1.000
                </span>
              </div>

              {formError && (
                <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            {taskStatus ? `Status AI: ${taskStatus}` : ""}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading || regenerating || !!loadError}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Simpan & Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomMappingWeightModal;