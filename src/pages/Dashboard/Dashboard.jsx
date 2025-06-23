import { useState, useEffect, useRef } from 'react';
import { Layers } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { FileCog } from 'lucide-react';
import { CheckCheck } from 'lucide-react';
import Chart from 'chart.js/auto';

const Dashboard = () => {
  const [activePage, setActivePage] = useState(null);
  const errorTypeLineChartRef = useRef(null);
  const gradeBarChartRef = useRef(null);
  const [chartInitialized, setChartInitialized] = useState(false);

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

  useEffect(() => {
    let errorTypeChart, gradeChart;

    if (!chartInitialized && !activePage) {
      const errorTypeCtx = errorTypeLineChartRef.current.getContext('2d');
      const gradeCtx = gradeBarChartRef.current.getContext('2d');

      errorTypeChart = new Chart(errorTypeCtx, {
        type: 'line',
        data: mockData.errorTypeTrends,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Count' },
              ticks: { stepSize: 400 },
            },
          },
          plugins: {
            legend: { position: 'bottom' },
          },
        },
      });

      gradeChart = new Chart(gradeCtx, {
        type: 'bar',
        data: mockData.gradeDistribution,
        options: {
          responsive: true,
          indexAxis: 'y',
          scales: {
            x: { beginAtZero: true, title: { display: true, text: 'Count' } },
          },
          plugins: {
            legend: { position: 'bottom' },
          },
        },
      });

      setChartInitialized(true);
    }

    return () => {
      if (errorTypeChart) errorTypeChart.destroy();
      if (gradeChart) gradeChart.destroy();
    };
  }, [activePage]);

  const handleInvestigate = (institution, grade) => {
    setActivePage({ type: 'investigation', institution, grade });
  };

  const handleView = (institution, grade) => {
    setActivePage({ type: 'matched', institution, grade });
  };

  return (
    <div
      className='p-6'
      style={{
        filter: `blur(5px)`,
        transition: 'filter 0.3s ease', 
      }}
    >
        <>
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8'>
            <div className='bg-white p-6 rounded-xl shadow-sm flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-slate-500'>
                  Total Batches In
                </p>
                <p className='text-3xl font-bold'>{mockData.totalBatches}</p>
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
                <p className='text-3xl font-bold'>{mockData.awaitingAction}</p>
              </div>
              <div className='bg-yellow-100 p-3 rounded-full'>
                <Loader2 className='text-yellow-600 w-6 h-6 animate-spin' />
              </div>
            </div>
            <div className='bg-white p-6 rounded-xl shadow-sm flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-slate-500'>
                  In Progress
                </p>
                <p className='text-3xl font-bold'>{mockData.inProgress}</p>
              </div>
              <div className='bg-orange-100 p-3 rounded-full'>
                <FileCog className='text-orange-600 w-6 h-6' />
              </div>
            </div>
            <div className='bg-white p-6 rounded-xl shadow-sm flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-slate-500'>Completed</p>
                <p className='text-3xl font-bold'>{mockData.completed}</p>
              </div>
              <div className='bg-green-100 p-3 rounded-full'>
                <CheckCheck className='text-green-600 w-6 h-6' />
              </div>
            </div>
          </div>
          <div className='grid grid-cols-1 xl:grid-cols-3 gap-8'>
            <div className='xl:col-span-2 bg-white p-6 rounded-xl shadow-sm'>
              <h3 className='font-semibold text-lg mb-4'>
                Error Type Trends (Last 7 Days)
              </h3>
              <canvas
                id='errorTypeLineChart'
                ref={errorTypeLineChartRef}
              ></canvas>
            </div>
            <div className='xl:col-span-1 bg-white p-6 rounded-xl shadow-sm'>
              <h3 className='font-semibold text-lg mb-4'>
                Data Count per Grade
              </h3>
              <canvas
                id='gradeBarChart'
                ref={gradeBarChartRef}
                style={{ height: '400px', width: '100%' }}
              ></canvas>
            </div>
            <div className='xl:col-span-3 bg-white p-6 rounded-xl shadow-sm'>
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
                    {mockData.recentBatches.map((batch, index) => (
                      <tr
                        key={index}
                        className='bg-white border-b border-slate-200 hover:bg-slate-50'
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
