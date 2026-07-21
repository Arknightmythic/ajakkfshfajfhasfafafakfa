import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../axios/axiosInstance";

// Bangun query-string period + custom date range sekali, dipakai untuk summary
// & latency chart. Retention summary tidak tergantung period jadi di-key sendiri.
const buildParams = (period, dateRange) => {
  const params = { period };
  if (period === "custom" && dateRange?.start && dateRange?.end) {
    params.start_date = dateRange.start;
    params.end_date = dateRange.end;
  }
  return params;
};

const useAuditSummary = (period, dateRange, refreshInterval) => {
  // React Query melakukan structural sharing pada queryKey, jadi dateRange yang
  // berupa object literal baru tiap render TIDAK memicu refetch selama nilainya
  // sama — masalah identity object di versi useEffect lama hilang di sini.
  const interval = refreshInterval > 0 ? refreshInterval : false;
  const params = buildParams(period, dateRange);

  const summaryQuery = useQuery({
    queryKey: ["audit", "summary", params],
    queryFn: async () => {
      const res = await axiosInstance.general.get("/audit/summary", { params });
      return res.data;
    },
    refetchInterval: interval,
    refetchOnWindowFocus: false,
  });

  const latencyQuery = useQuery({
    queryKey: ["audit", "latency", params],
    queryFn: async () => {
      const res = await axiosInstance.general.get("/audit/latency-chart", {
        params,
      });
      return res.data;
    },
    refetchInterval: interval,
    refetchOnWindowFocus: false,
  });

  const retentionQuery = useQuery({
    queryKey: ["audit", "retention"],
    queryFn: async () => {
      const res = await axiosInstance.general.get("/retention/summary");
      return res.data;
    },
    refetchInterval: interval,
    refetchOnWindowFocus: false,
  });

  return {
    summary: summaryQuery.data ?? { success: 0, failed: 0 },
    latencyData: latencyQuery.data ?? [],
    retention:
      retentionQuery.data ?? {
        total_executions: 0,
        success_executions: 0,
        last_execution: "Never",
      },
    // loading hanya true saat load pertama (belum ada data). Saat auto-refresh,
    // isLoading tetap false sehingga UI tidak berkedip — sama seperti intent
    // versi lama, tapi tanpa manual flag.
    loading:
      summaryQuery.isLoading ||
      latencyQuery.isLoading ||
      retentionQuery.isLoading,
  };
};

export default useAuditSummary;