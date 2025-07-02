import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Hourglass, Layers } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { FileCog } from 'lucide-react';
import { CheckCheck } from 'lucide-react';
import Chart from 'chart.js/auto';
import useDashboard from './hooks/useDashboard';
import { useNavigate } from 'react-router-dom';
import useGetData from "../BatchSynchronization/hooks/useGetData";


const Dashboard = () => {
  const [activePage, setActivePage] = useState(null);
  const gradeBarChartRef = useRef(null);
  const gradeChartInstance = useRef(null);
  const { dashboardData, loading, error } = useDashboard();
  const { data, refetch } = useGetData();

  const [filteredData, setFilteredData] = useState([]);
    useEffect(() => {
    if (!data || data.length === 0) {
      setFilteredData([]);
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    const filtered = data.filter((item) => {
      const itemDateStr = item.inserted_date?.slice(0, 10);
      return item.status_proses !== null && itemDateStr === todayStr;
    });

    setFilteredData(filtered);
  }, [data]);


  const computedData = useMemo(() => {
    if (!dashboardData) {
      return null;
    }
    const raw = dashboardData?.data || [];
    const gradeCounts = {
      'Grade A': 0,
      'Grade B': 0,
      'Grade C': 0,
      'Grade D': 0,
      'Grade E': 0,
    };

    const totalBatches = raw.length;
    console.log("line 51", raw)
    const completed = raw.filter(
      (r) => String(r.status_proses).toLowerCase() === 'completed'
    ).length;

    const awaitingAction = raw.filter(
      (r) => String(r.status_proses).toLowerCase() === 'awaiting action'
    ).length;

    const inProgress = raw.filter(
      (r) =>
        r.status_proses?.toLowerCase() === 'in progress').length;
    
    const pending = raw.filter(r => r.status_proses === null).length;

    raw.forEach((item) => {
      const grade = item.grade?.toUpperCase();
      if (['A', 'B', 'C', 'D', 'E'].includes(grade)) {
        gradeCounts[`Grade ${grade}`] += 1;
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
            '#86efac', 
            '#fde047', 
            '#fdba74', 
            '#d8b4fe', 
            '#fca5a5', 
          ],
        },
      ],
    };

    const formatStatus = (statusProses) => {
      if (statusProses) {
        const s = statusProses.toLowerCase();
        if (s === 'completed') return 'Completed';
        if (s === 'in progress') return 'In Progress';
        if (s === 'awaiting action') return 'Awaiting Action';
      }
      return statusProses || '';
    };

    const today = new Date().toISOString().split('T')[0]; 
    const recentBatches = raw
      .filter(
        (item) =>
          item.status_proses !== null &&
          item.inserted_date?.startsWith(today)
      )
      .sort(
        (a, b) =>
          new Date(b.inserted_date).getTime() -
          new Date(a.inserted_date).getTime()
      );

    return {
      totalBatches,
      completed,
      inProgress,
      awaitingAction,
      pending, 
      gradeDistribution,
      recentBatches: recentBatches.map((item) => ({
        id: item.id,
        institution: item.institution_name,
        fileName: item.file_name,
        status: formatStatus(item.status_proses),
        grade: item.grade,
        totalRecords: item.total_records,
        insertedDate: item.inserted_date,
      })),
      totalRecords: raw.reduce(
        (sum, item) => sum + (item.total_records || 0),
        0
      ),
      successRate:
        totalBatches > 0 ? ((completed / totalBatches) * 100).toFixed(1) : 0,
    };
  }, [dashboardData]);


  const isGradeDataEmpty =
    !computedData?.gradeDistribution ||
    !computedData.gradeDistribution.datasets?.[0]?.data?.some((val) => val > 0);

  useEffect(() => {
    if (gradeChartInstance.current) {
      gradeChartInstance.current.destroy();
      gradeChartInstance.current = null;
    }
    if (
      !activePage &&
      computedData?.gradeDistribution &&
      gradeBarChartRef.current &&
      !loading
    ) {
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
                title: {
                  display: true,
                  text: 'Data Count',
                },
                ticks: {
                  precision: 0,
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
                display: false,
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
  }, [activePage, computedData, loading]);

  const navigate = useNavigate();
  const statusColor = {
    "awaiting action": "bg-red-100 text-red-800",
    "in progress": "bg-orange-100 text-orange-800",
    "completed": "bg-green-100 text-green-800",
  };  
  
  const showInvestigationPage = (id, name, grade) => {
    navigate('/batch-synchronization/investigate', {
      state: {
        metadata_id: id,
        institutionName: name,
        statusGrade: grade
      },
    });

  };

  const showMatchedPage = (id, name, grade) => {
    navigate('/batch-synchronization/preview', {
      state: {
        metadata_id: id,
        institutionName: name,
        statusGrade: grade
      }
    });
  };

  const toTitleCase = (text) =>
  text
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  if (loading) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <Loader2 className='animate-spin w-8 h-8 mx-auto mb-4 text-blue-600 mt-5' />
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <h3 className='text-red-800 font-medium'>Error Loading Page</h3>
          <p className='text-red-600 mt-1'>{error}</p>
        </div>
      </div>
    );
  }

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
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8'>
        <div className='bg-white p-6 rounded-xl shadow-sm flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-slate-500'>
              Total
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
                    <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-3">Ministry/Institution</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {[...filteredData]
                .sort((a, b) => new Date(b.inserted_date) - new Date(a.inserted_date))
                .map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 font-medium">{item.institution_name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`${statusColor[item.status_proses.toLowerCase()]} text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full`}
                      >
                        {toTitleCase(item.status_proses)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.status_proses.toLowerCase() === "completed" || item.status_proses.toLowerCase() === "in progress" ? (
                          <button
                            onClick={() => {
                              if (item.status_proses.toLowerCase() === "completed") {
                                showMatchedPage(item.id, item.institution_name, item.grade);
                              }
                            }}
                            disabled={item.status_proses.toLowerCase() === "in progress"}
                            className={`font-medium ${
                              item.status_proses.toLowerCase() === "in progress"
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-blue-600 hover:underline cursor-pointer"
                            }`}
                          >
                            Preview
                          </button>
                      ) : (
                        <button
                          onClick={() => showInvestigationPage(item.id, item.institution_name, item.grade)}
                          className="font-medium text-blue-600 hover:underline cursor-pointer"
                        >
                          Investigate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                      No data found.
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
