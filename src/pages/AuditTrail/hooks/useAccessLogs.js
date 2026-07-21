import { useEffect, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axiosInstance from "../../../axios/axiosInstance";

// enabled dipakai untuk gating tab: tabel yang tidak sedang ditampilkan tidak
// perlu fetch/poll (menghemat request — di versi lama kedua tabel selalu jalan).
const useAccessLogs = (
  period,
  dateRange,
  refreshInterval,
  initialPage = 1,
  enabled = true,
) => {
  const [page, setPage] = useState(initialPage);

  // Reset ke halaman 1 setiap kali filter berubah.
  useEffect(() => {
    setPage(1);
  }, [period, dateRange]);

  const params = { page, period };
  if (period === "custom" && dateRange?.start && dateRange?.end) {
    params.start_date = dateRange.start;
    params.end_date = dateRange.end;
  }

  const query = useQuery({
    queryKey: ["access", "logs", params],
    queryFn: async () => {
      const res = await axiosInstance.general.get("/access/logs", { params });
      return res.data;
    },
    enabled,
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    refetchOnWindowFocus: false,
    // Saat pindah halaman, tahan data lama supaya tabel tidak "kedip" kosong.
    placeholderData: keepPreviousData,
  });

  return {
    logs: query.data?.data ?? [],
    // isFetching supaya indikator loading tetap muncul saat ganti halaman,
    // meski placeholderData menahan data lama.
    loading: query.isFetching,
    page,
    setPage,
    totalPages: query.data?.total_pages ?? 1,
  };
};

export default useAccessLogs;