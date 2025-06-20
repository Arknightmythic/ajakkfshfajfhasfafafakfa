import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Layers } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { FileCog } from 'lucide-react';
import { CheckCheck } from 'lucide-react';
import Chart from 'chart.js/auto';
import useDashboard from './hooks/useDashboard';

const Dashboard = () => {
  const [activePage, setActivePage] = useState(null);
  const gradeBarChartRef = useRef(null);
  const gradeChartInstance = useRef(null);
  const { dashboardData, loading, error } = useDashboard();

  const computedData = useMemo(() => {
    if (!dashboardData || !dashboardData['Postgre Metadata']) return null;

    const raw = dashboardData['Postgre Metadata'];
    const gradeCounts = {
      'Grade A': 0,
      'Grade B': 0,
      'Grade C': 0,
      'Grade D': 0,
      'Grade E': 0,
    };

    const totalBatches = raw.length;
    const awaitingAction = raw.filter(
      (r) => r.status_proses.toLowerCase() === 'awaiting action'
    ).length;
    const inProgress = raw.filter(
      (r) => r.status_proses.toLowerCase() === 'in progress'
    ).length;
    const completed = raw.filter(
      (r) => r.status_proses.toLowerCase() === 'completed'
    ).length;

    // raw.forEach((item) => {
    //   const gradeKey = `Grade ${item.grade.toUpperCase()}`;
    //   if (gradeCounts.hasOwnProperty(gradeKey)) {
    //     gradeCounts[gradeKey] += item.total_records;
    //   }
    // });

    raw.forEach((item) => {
      const gradeKey = `Grade ${item.grade.toUpperCase()}`;
      if (gradeCounts.hasOwnProperty(gradeKey)) {
        gradeCounts[gradeKey] += item.total_records;
      }
    });

    const gradeDistribution = {
      labels: ['Grade A', 'Grade B', 'Grade C', 'Grade D', 'Grade E'],
      datasets: [
        {
          label: 'Data Count',
          data: [
            gradeCounts['Grade A'],
            gradeCounts['Grade B'],
            gradeCounts['Grade C'],
            gradeCounts['Grade D'],
            gradeCounts['Grade E'],
          ],
          backgroundColor: [
            '#10b981',
            '#f59e0b',
            '#f97316',
            '#ef4444',
            '#8b5cf6',
          ],
        },
      ],
    };

    const formatStatus = (status) => {
      if (!status) return 'Unknown';
      const s = status.toLowerCase();
      if (s.includes('await')) return 'Awaiting Action';
      if (s.includes('progress')) return 'In Progress';
      if (s.includes('complete')) return 'Completed';
      return status;
    };

    const recentBatches = raw
      .sort((a, b) => new Date(b.insert_date) - new Date(a.insert_date))
      .slice(0, 3);

    return {
      totalBatches,
      awaitingAction,
      inProgress,
      completed,
      gradeDistribution,
      recentBatches: recentBatches.map((item) => ({
        institution: item.institution_name,
        status: formatStatus(item.status_proses),
        grade: item.grade,
      })),
    };
  }, [dashboardData]);

  const isGradeDataEmpty =
    !computedData?.gradeDistribution ||
    !computedData.gradeDistribution.datasets?.[0]?.data?.some((val) => val > 0);

  // Effect untuk membuat chart
  useEffect(() => {
    // Destroy existing chart jika ada
    if (gradeChartInstance.current) {
      gradeChartInstance.current.destroy();
      gradeChartInstance.current = null;
    }

    // Hanya buat chart jika:
    // 1. Tidak ada active page
    // 2. Ada computed data
    // 3. Canvas ref tersedia
    // 4. Tidak sedang loading
    if (
      !activePage &&
      computedData?.gradeDistribution &&
      gradeBarChartRef.current &&
      !loading
    ) {
      const canvas = gradeBarChartRef.current;
      const ctx = canvas.getContext('2d');

      console.log('Creating chart with data:', computedData.gradeDistribution);

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
                title: {
                  display: true,
                  text: 'Data Count',
                },
                ticks: {
                  callback: (value) => {
                    if (value >= 1000000) {
                      return `${(value / 1000000).toFixed(1)}M`;
                    } else if (value >= 1000) {
                      return `${(value / 1000).toFixed(0)}k`;
                    }
                    return value;
                  },
                },
              },
              y: {
                ticks: {
                  font: {
                    size: 12,
                  },
                },
              },
            },
            plugins: {
              legend: {
                display: false, // Hide legend karena sudah jelas dari labels
              },
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

        console.log('Chart created successfully:', gradeChartInstance.current);
      } catch (error) {
        console.error('Error creating chart:', error);
      }
    }

    // Cleanup function
    return () => {
      if (gradeChartInstance.current) {
        gradeChartInstance.current.destroy();
        gradeChartInstance.current = null;
      }
    };
  }, [activePage, computedData, loading]);

  const handleInvestigate = (institution, grade) => {
    setActivePage({ type: 'investigation', institution, grade });
  };

  const handleView = (institution, grade) => {
    setActivePage({ type: 'matched', institution, grade });
  };

  const handleBack = () => {
    setActivePage(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <Loader2 className='animate-spin w-8 h-8 mx-auto mb-4 text-blue-600' />
          <p className='text-gray-600'>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
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

  // No data state
  if (!computedData) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <p className='text-gray-600'>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white p-6 rounded-xl shadow-sm flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-slate-500'>
              Total Batches In
            </p>
            <p className='text-3xl font-bold'>{computedData.totalBatches}</p>
          </div>
          <div className='bg-blue-100 p-3 rounded-full'>
            <Layers className='text-blue-600' />
          </div>
        </div>
        <div className='bg-white p-6 rounded-xl shadow-sm flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-slate-500'>
              Awaiting Action
            </p>
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
      </div>

      {/* Charts and Table */}
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
        {/* Chart Section */}
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
          <div className='overflow-x-auto'>
            <table className='w-full text-sm text-left'>
              <thead className='text-xs text-slate-500 uppercase bg-slate-50'>
                <tr>
                  <th className='px-6 py-3'>Ministry/Institution</th>
                  <th className='px-6 py-3'>Status</th>
                  <th className='px-6 py-3 text-center'>Action</th>
                </tr>
              </thead>
              <tbody>
                {computedData &&
                computedData.recentBatches &&
                computedData.recentBatches.length > 0 ? (
                  computedData.recentBatches.map((batch, index) => (
                    <tr
                      key={index}
                      className='bg-white border-b border-slate-300 hover:bg-slate-50'
                    >
                      <td className='px-6 py-4 font-medium'>
                        {batch.institution}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            batch.status === 'Awaiting Action'
                              ? 'bg-red-100 text-red-800'
                              : batch.status === 'In Progress'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {batch.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-center'>
                        <button
                          onClick={() =>
                            batch.status === 'Completed'
                              ? handleView(batch.institution, batch.grade)
                              : handleInvestigate(
                                  batch.institution,
                                  batch.grade
                                )
                          }
                          className='font-medium text-blue-600 hover:underline'
                        >
                          {batch.status === 'Completed'
                            ? 'View'
                            : 'Investigate'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className='text-sm text-center text-slate-500 py-6'
                    >
                      No data available.
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
