import React, { useState, useEffect, useRef } from 'react';
import { Layers } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { FileCog } from 'lucide-react';
import { CheckCheck } from 'lucide-react';
import Chart from 'chart.js/auto';
import useDashboard from './hooks/useDashboard'; 

const Dashboard = () => {
  const [activePage, setActivePage] = useState(null);
  const errorTypeLineChartRef = useRef(null);
  const gradeBarChartRef = useRef(null);
  const [chartInitialized, setChartInitialized] = useState(false);
  const { dashboardData, loading, error } = useDashboard();

  const mockData = {
    totalBatches: 124,
    awaitingAction: 15,
    inProgress: 8,
    completed: 101,
    errorTypeTrends: {
      labels: ['Jun 4', 'Jun 5', 'Jun 6', 'Jun 7', 'Jun 8', 'Jun 9', 'Jun 10'],
      datasets: [
        {
          label: 'Name Typo',
          data: [1400, 1450, 1800, 1600, 1550, 1650, 1600],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Invalid Date Format',
          data: [1000, 1050, 1100, 1200, 1150, 1250, 1300],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'NIK Not Found',
          data: [2000, 2050, 2200, 2100, 2150, 2300, 2400],
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    gradeDistribution: {
      labels: ['Grade A', 'Grade B', 'Grade C', 'Grade D', 'Grade E'],
      datasets: [
        {
          label: 'Data Count',
          data: [1500000, 1000000, 700000, 500000, 300000],
          backgroundColor: [
            '#10b981',
            '#f59e0b',
            '#f97316',
            '#ef4444',
            '#8b5cf6',
          ],
        },
      ],
    },
    recentBatches: [
      {
        institution: 'Ministry of Social Affairs',
        status: 'Awaiting Action',
        grade: 'E',
      },
      { institution: 'Ministry of Health', status: 'In Progress', grade: 'E' },
      {
        institution: 'State Civil Service Agency',
        status: 'Completed',
        grade: 'A',
      },
    ],
  };

  const computedData = (() => {
    if (!dashboardData || !dashboardData['Postgre Metadata']) return null;

    const records = dashboardData['Postgre Metadata'];

    const totalBatches = records.length;
    const awaitingAction = records.filter(
      (r) => r.status_proses.toLowerCase() === 'awaiting action'
    ).length;
    const inProgress = records.filter(
      (r) => r.status_proses.toLowerCase() === 'in progress'
    ).length;
    const completed = records.filter(
      (r) => r.status_proses.toLowerCase() === 'completed'
    ).length;

    const gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    records.forEach((r) => {
      const grade = r.grade.toUpperCase();
      if (gradeCounts[grade] !== undefined) {
        gradeCounts[grade] += r.total_records;
      }
    });

    const gradeDistribution = {
      labels: ['Grade A', 'Grade B', 'Grade C', 'Grade D', 'Grade E'],
      datasets: [
        {
          label: 'Data Count',
          data: [
            gradeCounts.A,
            gradeCounts.B,
            gradeCounts.C,
            gradeCounts.D,
            gradeCounts.E,
          ],
          backgroundColor: [
            '#10b981', // A
            '#f59e0b', // B
            '#f97316', // C
            '#ef4444', // D
            '#8b5cf6', // E
          ],
        },
      ],
    };

    const recentBatches = [...records]
      .sort((a, b) => new Date(b.insert_date) - new Date(a.insert_date))
      .slice(0, 3)
      .map((r) => ({
        institution: r.institution_name,
        status:
          r.status_proses.toLowerCase() === 'awaiting action'
            ? 'Awaiting Action'
            : r.status_proses.toLowerCase() === 'in progress'
            ? 'In Progress'
            : 'Completed',
        grade: r.grade,
      }));

    return {
      totalBatches,
      awaitingAction,
      inProgress,
      completed,
      gradeDistribution,
      recentBatches,
    };
  })();

  useEffect(() => {
    const ctx = gradeBarChartRef.current?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['A', 'B', 'C'],
        datasets: [
          {
            label: 'Sample',
            data: [10, 20, 30],
            backgroundColor: ['red', 'green', 'blue'],
          },
        ],
      },
    });
  }, []);
  
  
  
  // useEffect(() => {
  //   let gradeChart;

  //   if (
  //     computedData &&
  //     computedData.gradeDistribution &&
  //     gradeBarChartRef.current &&
  //     !chartInitialized &&
  //     !activePage
  //   ) {
  //     const ctx = gradeBarChartRef.current.getContext('2d');

  //     gradeChart = new Chart(ctx, {
  //       type: 'bar',
  //       data: computedData.gradeDistribution,
  //       options: {
  //         responsive: true,
  //         indexAxis: 'y',
  //         scales: {
  //           x: {
  //             beginAtZero: true,
  //             title: { display: true, text: 'Data Count' },
  //             ticks: {
  //               callback: (value) => `${value / 1000}k`,
  //             },
  //           },
  //         },
  //         plugins: {
  //           legend: {
  //             position: 'bottom',
  //           },
  //         },
  //       },
  //     });

  //     setChartInitialized(true);
  //   }

  //   return () => {
  //     if (gradeChart) {
  //       gradeChart.destroy();
  //     }
  //   };
  // }, [computedData, chartInitialized, activePage]);
  

  // useEffect(() => {
  //   let errorTypeChart, gradeChart;

  //   if (!chartInitialized && !activePage) {
  //     const gradeCtx = gradeBarChartRef.current.getContext('2d');
  //     gradeChart = new Chart(gradeCtx, {
  //       type: 'bar',
  //       data: mockData.gradeDistribution,
  //       // data: computedData?.gradeDistribution,
  //       options: {
  //         responsive: true,
  //         indexAxis: 'y',
  //         scales: {
  //           x: {
  //             beginAtZero: true,
  //             title: { display: true, text: 'Data Count' },
  //             ticks: { callback: (value) => `${value / 1000}k` },
  //           },
  //         },
  //         plugins: {
  //           legend: { position: 'bottom' },
  //         },
  //       },
  //     });

  //     setChartInitialized(true);
  //   }

  //   // Cleanup function
  //   return () => {
  //     if (errorTypeChart) errorTypeChart.destroy();
  //     if (gradeChart) gradeChart.destroy();
  //   };
  // }, [activePage]);

  const handleInvestigate = (institution, grade) => {
    setActivePage({ type: 'investigation', institution, grade });
  };

  const handleView = (institution, grade) => {
    setActivePage({ type: 'matched', institution, grade });
  };

  const handleBack = () => {
    setActivePage(null);
  };

  useEffect(() => {
    if (dashboardData) {
      console.log('Dashboard Data:', dashboardData);
    }
  }, [dashboardData]);
  

  return (
    <div className='p-6'>
      <>
        {/* tampilkan data hasil fetch */}
        {error && <div className='text-red-600 mb-4'>Error: {error}</div>}

        {dashboardData && (
          <pre className='bg-gray-100 text-sm p-4 rounded mb-6 overflow-x-auto'>
            {JSON.stringify(dashboardData, null, 2)}
          </pre>
        )}

        {/* ...lanjutan dashboard yang sudah kamu buat */}
        {/* mulai dari <div className='grid grid-cols-1 sm:grid-cols-2 ... dst */}
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white p-6 rounded-xl shadow-sm flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-500'>
                Total Batches In
              </p>
              <p className='text-3xl font-bold'>{computedData?.totalBatches}</p>
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
              <p className='text-3xl font-bold'>
                {computedData?.awaitingAction}
              </p>
            </div>
            <div className='bg-yellow-100 p-3 rounded-full'>
              <Loader2 className='text-yellow-600 w-6 h-6' />
            </div>
          </div>
          <div className='bg-white p-6 rounded-xl shadow-sm flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-500'>In Progress</p>
              <p className='text-3xl font-bold'>{computedData?.inProgress}</p>
            </div>
            <div className='bg-orange-100 p-3 rounded-full'>
              <FileCog className='text-orange-600 w-6 h-6' />
            </div>
          </div>
          <div className='bg-white p-6 rounded-xl shadow-sm flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-500'>Completed</p>
              <p className='text-3xl font-bold'>{computedData?.completed}</p>
            </div>
            <div className='bg-green-100 p-3 rounded-full'>
              <CheckCheck className='text-green-600 w-6 h-6' />
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
          <div className='xl:col-span-1 bg-white p-6 rounded-xl shadow-sm flex-1'>
            {/* <h3 className='font-semibold text-lg mb-4'>
                Error Type Trends (Last 7 Days)
              </h3> */}
            {/* <canvas
                id='errorTypeLineChart'
                ref={errorTypeLineChartRef}
              ></canvas> */}

            <h3 className='font-semibold text-lg mb-4'>Data Count per Grade</h3>
            {/* <canvas
              id='gradeBarChart'
              ref={gradeBarChartRef}
              // style={{ height: '250px', width: '100%' }}
              className='h-[40vh] md:h-[30vh] lg:h-[25vh] w-full'
            ></canvas> */}
            {computedData?.gradeDistribution && (
              <canvas
                ref={gradeBarChartRef}
                className='h-[40vh] md:h-[30vh] lg:h-[25vh] w-full'
              />
            )}
          </div>

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
                  {computedData?.recentBatches.map((batch, index) => (
                    <tr
                      key={index}
                      className='bg-white border-b border-slate-300 hover:bg-slate-50'
                    >
                      <td className='px-6 py-4 font-medium'>
                        {batch.institution}
                      </td>
                      <td className='px-6 py-4'>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    </div>
  );
};

export default Dashboard;
