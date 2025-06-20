import { useState, useMemo } from 'react';
import { Search, Download, FileText, Calendar, Filter } from 'lucide-react';

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleDownloadMatched = () => {
    alert('Mengunduh data yang cocok...');
    // Add your download matched logic here
  };

  const handleDownloadUnmatched = () => {
    alert('Mengunduh data yang tidak cocok...');
    // Add your download unmatched logic here
  };

  // Expanded dummy data
  const historyData = [
    {
      id: 1,
      institution: 'State Civil Service Agency',
      completionDate: '2025-06-18',
      matchedRecords: 74980,
      unmatchedRecords: 20,
      totalRecords: 75000,
      processingTime: '2h 15m',
      grade: 'A',
    },
    {
      id: 2,
      institution: 'Ministry of Health',
      completionDate: '2025-06-17',
      matchedRecords: 128450,
      unmatchedRecords: 550,
      totalRecords: 129000,
      processingTime: '3h 42m',
      grade: 'B',
    },
    {
      id: 3,
      institution: 'Ministry of Education and Culture',
      completionDate: '2025-06-16',
      matchedRecords: 95200,
      unmatchedRecords: 1800,
      totalRecords: 97000,
      processingTime: '2h 58m',
      grade: 'C',
    },
    {
      id: 4,
      institution: 'Ministry of Social Affairs',
      completionDate: '2025-06-15',
      matchedRecords: 67800,
      unmatchedRecords: 2200,
      totalRecords: 70000,
      processingTime: '1h 45m',
      grade: 'D',
    },
    {
      id: 5,
      institution: 'Ministry of Finance',
      completionDate: '2025-06-14',
      matchedRecords: 156700,
      unmatchedRecords: 300,
      totalRecords: 157000,
      processingTime: '4h 12m',
      grade: 'A',
    },
    {
      id: 6,
      institution: 'Ministry of Transportation',
      completionDate: '2025-06-13',
      matchedRecords: 89500,
      unmatchedRecords: 1500,
      totalRecords: 91000,
      processingTime: '2h 33m',
      grade: 'C',
    },
    {
      id: 7,
      institution: 'Ministry of Agriculture',
      completionDate: '2025-06-12',
      matchedRecords: 45200,
      unmatchedRecords: 4800,
      totalRecords: 50000,
      processingTime: '1h 28m',
      grade: 'E',
    },
    {
      id: 8,
      institution: 'Ministry of Energy and Mineral Resources',
      completionDate: '2025-06-11',
      matchedRecords: 34500,
      unmatchedRecords: 1500,
      totalRecords: 36000,
      processingTime: '1h 15m',
      grade: 'C',
    },
    {
      id: 9,
      institution: 'Ministry of Public Works and Housing',
      completionDate: '2025-06-10',
      matchedRecords: 78900,
      unmatchedRecords: 1100,
      totalRecords: 80000,
      processingTime: '2h 45m',
      grade: 'B',
    },
    {
      id: 10,
      institution: 'Ministry of Trade',
      completionDate: '2025-06-09',
      matchedRecords: 52300,
      unmatchedRecords: 2700,
      totalRecords: 55000,
      processingTime: '1h 52m',
      grade: 'D',
    },
    {
      id: 11,
      institution: 'Ministry of Tourism and Creative Economy',
      completionDate: '2025-06-08',
      matchedRecords: 28900,
      unmatchedRecords: 1100,
      totalRecords: 30000,
      processingTime: '58m',
      grade: 'B',
    },
    {
      id: 12,
      institution: 'Ministry of Communication and Information',
      completionDate: '2025-06-07',
      matchedRecords: 41200,
      unmatchedRecords: 3800,
      totalRecords: 45000,
      processingTime: '1h 33m',
      grade: 'E',
    },
    {
      id: 13,
      institution: 'National Police',
      completionDate: '2025-06-06',
      matchedRecords: 112400,
      unmatchedRecords: 600,
      totalRecords: 113000,
      processingTime: '3h 25m',
      grade: 'A',
    },
    {
      id: 14,
      institution: 'Indonesian Armed Forces',
      completionDate: '2025-06-05',
      matchedRecords: 98700,
      unmatchedRecords: 1300,
      totalRecords: 100000,
      processingTime: '3h 8m',
      grade: 'B',
    },
    {
      id: 15,
      institution: 'Ministry of Religious Affairs',
      completionDate: '2025-06-04',
      matchedRecords: 134500,
      unmatchedRecords: 2500,
      totalRecords: 137000,
      processingTime: '3h 55m',
      grade: 'C',
    },
    {
      id: 16,
      institution: 'State Civil Service Agency',
      completionDate: '2025-06-08',
      matchedRecords: 74980,
      unmatchedRecords: 20,
      unmatchedPercentage: '0.03%',
      totalRecords: 137000,
      processingTime: '3h 55m',
      grade: 'C',
    },
  ];

  // Enhanced filtering and sorting logic
    const filteredAndSortedData = useMemo(() => {
      let filtered = historyData;
  
      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter((item) =>
          item.institution.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
  
      // Filter by grade/status
      if (statusFilter !== 'all') {
        filtered = filtered.filter((item) => item.grade === statusFilter);
      }
  
      // Filter by date range
      if (dateFilter !== 'all') {
        const today = new Date();
        const filterDate = new Date();
        
        switch (dateFilter) {
          case 'week':
            filterDate.setDate(today.getDate() - 7);
            break;
          case 'month':
            filterDate.setMonth(today.getMonth() - 1);
            break;
          case 'quarter':
            filterDate.setMonth(today.getMonth() - 3);
            break;
        }
        
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.completionDate);
          return itemDate >= filterDate;
        });
      }
  
      // Sort data
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'date':
            aValue = new Date(a.completionDate);
            bValue = new Date(b.completionDate);
            break;
          case 'institution':
            aValue = a.institution.toLowerCase();
            bValue = b.institution.toLowerCase();
            break;
          case 'matched':
            aValue = a.matchedRecords;
            bValue = b.matchedRecords;
            break;
          case 'unmatched':
            aValue = a.unmatchedRecords;
            bValue = b.unmatchedRecords;
            break;
          case 'percentage':
            aValue = (a.unmatchedRecords / a.totalRecords) * 100;
            bValue = (b.unmatchedRecords / b.totalRecords) * 100;
            break;
          default:
            return 0;
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  
      return filtered;
    }, [historyData, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);
  

  // Filter data based on search term
  const filteredData = historyData.filter((item) =>
    item.institution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id='historyPage' className=''>
      <div className='bg-white p-6 rounded-xl shadow-sm'>
        <div className='mb-6 space-y-4'>
          {/* Search Bar */}
          <div className='flex justify-end items-center'>                 
            <div className='relative w-[300px]'>
              <input
                type='text'
                placeholder='Search institutions...'
                className='w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                className='text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2'
                size={18}
              />
            </div>
          </div>
          {/* Filter Controls */}
          <div className='flex flex-wrap gap-4 items-center'>
            <div className='flex items-center gap-2'>
              <Filter size={16} className='text-gray-500' />
              <span className='text-sm font-medium text-gray-700'>
                Filters:
              </span>
            </div>

            {/* Grade Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600'
            >
              <option value='all'>All Grades</option>
              <option value='A'>Grade A</option>
              <option value='B'>Grade B</option>
              <option value='C'>Grade C</option>
              <option value='D'>Grade D</option>
              <option value='E'>Grade E</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600'
            >
              <option value='all'>All Time</option>
              <option value='week'>Last Week</option>
              <option value='month'>Last Month</option>
              <option value='quarter'>Last 3 Months</option>
            </select>

            {/* Results Count */}
            <div className='ml-auto text-sm text-gray-600'>
              Showing {filteredAndSortedData.length} of {historyData.length}{' '}
              records
            </div>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead className='text-xs text-slate-500 uppercase bg-slate-50'>
              <tr>
                <th className='px-6 py-3'>Ministry/Institution</th>
                <th className='px-6 py-3'>Completion Date</th>
                <th className='px-6 py-3'>Matched Records</th>
                <th className='px-6 py-3'>Unmatched Records</th>
                <th className='px-6 py-3'>Unmatched %</th>
                <th className='px-6 py-3 text-center'>Action</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((item, index) => (
                <tr key={index} className='bg-white border-b hover:bg-slate-50'>
                  <td className='px-6 py-4 font-medium'>{item.institution}</td>
                  <td className='px-6 py-4'>{item.completionDate}</td>
                  <td className='px-6 py-4 text-green-600'>
                    {item.matchedRecords}
                  </td>
                  <td className='px-6 py-4 text-red-600'>
                    {item.unmatchedRecords}
                  </td>
                  <td className='px-6 py-4 text-red-600 font-semibold'>
                    {item.unmatchedPercentage}
                  </td>
                  <td className='flex px-6 py-4 text-center space-x-2'>
                    <button
                      onClick={handleDownloadMatched}
                      className='bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 text-xs whitespace-nowrap'
                    >
                      Download Matched
                    </button>
                    <button
                      onClick={handleDownloadUnmatched}
                      className='bg-slate-500 text-white px-2 py-1 rounded-md hover:bg-slate-600 text-xs whitespace-nowrap'
                    >
                      Download Unmatched
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
