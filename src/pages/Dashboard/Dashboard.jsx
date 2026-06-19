import React, { useEffect, useRef, useMemo } from 'react';
import { Hourglass, Layers, Loader2, FileCog, CheckCheck } from 'lucide-react';
import Chart from 'chart.js/auto';
import useDashboard from './hooks/useDashboard';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const gradeBarChartRef = useRef(null);
  const gradeChartInstance = useRef(null);
  const navigate = useNavigate();
  
  // Mengambil data dari hook baru
  const { dashboardData, loading, error } = useDashboard();

  // Memetakan data summary dari API
  const computedData = useMemo(() => {
    if (!dashboardData?.data?.summary) return null;

    const summary = dashboardData.data.summary;

    const gradeDistribution = {
      labels: ['Grade A', 'Grade B', 'Grade C', 'Grade D', 'Grade E'],
      datasets: [
        {
          label: 'Data Count',
          data: [
            summary.total_grade_a || 0,
            summary.total_grade_b || 0,
            summary.total_grade_c || 0,
            summary.total_grade_d || 0,
            summary.total_grade_e || 0,
          ],
          backgroundColor: [
            '#86efac', // A - Green
            '#fde047', // B - Yellow
            '#fdba74', // C - Orange
            '#d8b4fe', // D - Purple
            '#fca5a5', // E - Red
          ],
        },
      ],
    };

    return {
      totalBatches: summary.total_files || 0,
      completed: summary.total_completed || 0,
      inProgress: summary.total_in_progress || 0,
      awaitingAction: summary.total_awaiting_action || 0,
      pending: summary.total_pending || 0,
      gradeDistribution,
    };
  }, [dashboardData]);

  // Ekstrak recent files langsung dari payload API
  const recentFiles = useMemo(() => {
    return dashboardData?.data?.recent_sync_files || [];
  }, [dashboardData]);

  const isGradeDataEmpty =
    !computedData?.gradeDistribution ||
    !computedData.gradeDistribution.datasets?.[0]?.data?.some((val) => val > 0);

  // Efek untuk me-render Chart.js
  useEffect(() => {
    if (gradeChartInstance.current) {
      gradeChartInstance.current.destroy();
      gradeChartInstance.current = null;
    }

    if (computedData?.gradeDistribution && gradeBarChartRef.current && !loading) {
      const canvas = gradeBarChartRef.current;
      const ctx = canvas.getContext('2d');

      try {
        gradeChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: computedData.gradeDistribution,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
              x: {
                beginAtZero: true,
                title: { display: true, text: 'Data Count' },
                ticks: {
                  precision: 0,
                  callback: (value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                    return value;
                  },
                },
              },
              y: { ticks: { font: { size: 12 } } },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `Count: ${context.raw.toLocaleString()}`;
                  },
                },
              },
            },
            animation: {
              duration: 1000,
              easing: 'easeInOutQuart',
            },
          },
        });
      } catch (error) {
        console.error('Error creating chart:', error);
      }
    }

    return () => {
      if (gradeChartInstance.current) {
        gradeChartInstance.current.destroy();
        gradeChartInstance.current = null;
      }
    };
  }, [computedData, loading]);

  const statusColor = {
    "awaiting action": "bg-red-100 text-red-800",
    "in progress": "bg-orange-100 text-orange-800",
    "completed": "bg-green-100 text-green-800",
    "pending": "bg-gray-100 text-gray-800",
  };  
  
  const showInvestigationPage = (id, name, grade) => {
    navigate('/batch-synchronization/investigate', {
      state: { metadata_id: id, institutionName: name, statusGrade: grade },
    });
  };

  const showMatchedPage = (id, name, grade) => {
    navigate('/batch-synchronization/preview', {
      state: { metadata_id: id, institutionName: name, statusGrade: grade }
    });
  };

  const toTitleCase = (text) => {
    if (!text) return "";
    return text.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  if (loading && !computedData) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <Loader2 className='animate-spin w-8 h-8 mx-auto mb-4 text-blue-600 mt-5' />
          <p className='text-gray-600'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <h3 className='text-red-800 font-medium'>Error Loading Dashboard</h3>
          <p className='text-red-600 mt-1'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      {/* Stats Cards */}
      {computedData && (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8'>
          <div className='bg-white p-6 rounded-xl shadow-sm flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-500'>Total</p>
              <p className='text-3xl font-bold'>{computedData.totalBatches}</p>
            </div>
            <div className='bg-blue-100 p-3 rounded-full'>
              <Layers className='text-blue-600' />
            </div>
          </div>
          <div className='bg-white p-6 rounded-xl shadow-sm flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-500'>Awaiting Action</p>
              <p className='text-3xl font-bold'>{computedData.awaitingAction}</p>
            </div>
            <div className='bg-yellow-100 p-3 rounded-full'>
              <Loader2 className='text-yellow-600 w-6 h-6' />
            </div>
          </div>
          <div className='bg-white p-6 rounded-xl shadow-sm flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-500'>In Progress</p>
              <p className='text-3xl font-bold'>{computedData.inProgress}</p>
            </div>
            <div className='bg-orange-100 p-3 rounded-full'>
              <FileCog className='text-orange-600 w-6 h-6' />
            </div>
          </div>
          <div className='bg-white p-6 rounded-xl shadow-sm flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-500'>Completed</p>
              <p className='text-3xl font-bold'>{computedData.completed}</p>
            </div>
            <div className='bg-green-100 p-3 rounded-full'>
              <CheckCheck className='text-green-600 w-6 h-6' />
            </div>
          </div>
          <div className='bg-white p-6 rounded-xl shadow-sm flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-500'>Pending</p>
              <p className='text-3xl font-bold'>{computedData.pending}</p>
            </div>
            <div className='bg-purple-100 p-3 rounded-full'>
              <Hourglass className='text-purple-600 w-6 h-6' />
            </div>
          </div>
        </div>
      )}

      {/* Charts and Table */}
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
        <div className='xl:col-span-1 bg-white p-6 rounded-xl shadow-sm'>
          <h3 className='font-semibold text-lg mb-4'>Data Count per Grade</h3>
          <div className='relative h-[300px] w-full'>
            {isGradeDataEmpty ? (
              <div className='absolute inset-0 flex items-center justify-center text-gray-400'>
                No data available.
              </div>
            ) : (
              <canvas ref={gradeBarChartRef} className='w-full h-full' />
            )}
          </div>
        </div>

        {/* Recent Batches Table */}
        <div className='xl:col-span-1 bg-white p-6 rounded-xl shadow-sm'>
          <h3 className='font-semibold text-lg mb-4'>Recent Batches</h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-3">Ministry/Institution</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentFiles.map((item, idx) => (
                  <tr key={item.file_id || item.id || idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{item.institution_name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`${statusColor[(item.sync_status || '').toLowerCase()] || "bg-gray-100 text-gray-800"} text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full`}
                      >
                        {toTitleCase(item.sync_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(item.sync_status || '').toLowerCase() === "completed" || (item.sync_status || '').toLowerCase() === "in progress" ? (
                        <button
                          onClick={() => {
                            if (item.sync_status.toLowerCase() === "completed") {
                              showMatchedPage(item.file_id || item.id, item.institution_name, item.grade);
                            }
                          }}
                          disabled={(item.sync_status || '').toLowerCase() === "in progress"}
                          className={`font-medium ${
                            (item.sync_status || '').toLowerCase() === "in progress"
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-blue-600 hover:underline cursor-pointer"
                          }`}
                        >
                          Preview
                        </button>
                      ) : (
                        <button
                          onClick={() => showInvestigationPage(item.file_id || item.id, item.institution_name, item.grade)}
                          className="font-medium text-blue-600 hover:underline cursor-pointer"
                        >
                          Investigate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {recentFiles.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      No recent batches found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;