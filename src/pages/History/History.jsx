import { useState, useMemo, useEffect } from 'react';
import { Search, Download, FileText, Calendar, Filter } from 'lucide-react';
import RangeCalendarFilter from './Calendar';
import useHistory from './hooks/useHistory';
import { use } from 'react';

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const { historyData, loading, error } = useHistory();
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
  });

  const handleDownloadMatched = () => {
    alert('Mengunduh data yang cocok...');
    // Add your download matched logic here
  };

  const handleDownloadUnmatched = () => {
    alert('Mengunduh data yang tidak cocok...');
    // Add your download unmatched logic here
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    // Extract the actual array from the nested response structure
    let dataArray = [];

    if (historyData) {
      // Try different possible nested structures
      if (
        historyData['Postgre history data'] &&
        Array.isArray(historyData['Postgre history data'])
      ) {
        dataArray = historyData['Postgre history data'];
      } else if (historyData.data && Array.isArray(historyData.data)) {
        dataArray = historyData.data;
      } else if (Array.isArray(historyData)) {
        dataArray = historyData;
      } else {
        console.warn('Unable to extract array from historyData:', historyData);
        return [];
      }
    }

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return [];
    }

    let filtered = dataArray;

    console.log('dataaray: ', filtered);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.institution_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.completion_date);
        const startDate = new Date(dateFilter.startDate);
        const endDate = new Date(dateFilter.endDate);

        // Set time to start/end of day for accurate comparison
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // Filter by status (if you have this filter)
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((item) => {
        switch (statusFilter) {
          case 'matched':
            return (
              (item.auto_matched || 0) > 0 || (item.manual_matched || 0) > 0
            );
          case 'unmatched':
            return (item.unmatched || 0) > 0;
          case 'auto-matched':
            return (item.auto_matched || 0) > 0;
          case 'manual-matched':
            return (item.manual_matched || 0) > 0;
          default:
            return true;
        }
      });
    }

    // Sort data
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.completion_date);
          bValue = new Date(b.completion_date);
          break;
        case 'institution_name':
          aValue = (a.institution_name || '').toLowerCase();
          bValue = (b.institution_name || '').toLowerCase();
          break;
        case 'automatched':
          aValue = a.auto_matched || 0;
          bValue = b.auto_matched || 0;
          break;
        case 'manualmatched':
          aValue = a.manual_matched || 0;
          bValue = b.manual_matched || 0;
          break;
        case 'unmatched':
          aValue = a.unmatched || 0;
          bValue = b.unmatched || 0;
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

  const formatNumber = (num) => {
    return (num || 0).toLocaleString();
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const highlightSearchTerm = (text, searchTerm) => {
    if (!text || !searchTerm.trim()) return text || '';

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi'
    );
    return text
      .split(regex)
      .map((part, i) =>
        regex.test(part) ? <mark key={i}>{part}</mark> : part
      );
  };

  // Get the total count for display
  const getTotalRecordCount = () => {
    if (!historyData) return 0;

    if (
      historyData['Postgre history data'] &&
      Array.isArray(historyData['Postgre history data'])
    ) {
      return historyData['Postgre history data'].length;
    } else if (historyData.data && Array.isArray(historyData.data)) {
      return historyData.data.length;
    } else if (Array.isArray(historyData)) {
      return historyData.length;
    }
    return 0;
  };

  useEffect(() => {
    console.log('historyData:', historyData);
    console.log('historyData[data]:', historyData?.['Postgre history data']);
    console.log('historyData type:', typeof historyData);
    console.log('is array:', Array.isArray(historyData));
  }, [historyData]);

  // Loading state
  if (loading) {
    return (
      <div id='historyPage' className=''>
        <div className='bg-white p-6 rounded-xl shadow-sm'>
          <div className='flex justify-center items-center h-64'>
            <div className='text-gray-500'>Loading history data...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div id='historyPage' className=''>
        <div className='bg-white p-6 rounded-xl shadow-sm'>
          <div className='flex justify-center items-center h-64'>
            <div className='text-red-500'>Error loading data: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id='historyPage' className=''>
      <div className='bg-white p-6 rounded-xl shadow-sm'>
        <div className='mb-6 space-y-4'>
          {/* Filter Controls */}
          <div className='flex flex-wrap gap-4 items-center justify-between'>
            <div className='flex flex-row gap-3'>
              <div className='flex items-center gap-2'>
                <Filter size={16} className='text-gray-500' />
                <span className='text-sm font-medium text-gray-700'>
                  Filters:
                </span>
              </div>

              {/* Date Range Filter - ADD THIS */}
              <RangeCalendarFilter
                onDateChange={(start, end) =>
                  setDateFilter({ startDate: start, endDate: end })
                }
                startDate={dateFilter.startDate}
                endDate={dateFilter.endDate}
              />
            </div>
            {/* Search Bar */}
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
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead className='text-xs text-slate-500 uppercase bg-slate-50'>
              <tr>
                <th
                  className='px-6 py-3 cursor-pointer hover:bg-slate-100'
                  onClick={() => handleSort('institution_name')}
                >
                  <div className='flex items-center gap-1'>
                    Ministry/Institution
                    <span className='text-xs'>
                      {getSortIcon('institution_name')}
                    </span>
                  </div>
                </th>
                <th
                  className='px-6 py-3 cursor-pointer hover:bg-slate-100'
                  onClick={() => handleSort('date')}
                >
                  <div className='flex items-center gap-1'>
                    Completion Date
                    <span className='text-xs'>{getSortIcon('date')}</span>
                  </div>
                </th>
                <th
                  className='px-6 py-3 cursor-pointer hover:bg-slate-100'
                  onClick={() => handleSort('automatched')}
                >
                  <div className='flex items-center gap-1'>
                    Auto Matched
                    <span className='text-xs'>
                      {getSortIcon('automatched')}
                    </span>
                  </div>
                </th>
                <th
                  className='px-6 py-3 cursor-pointer hover:bg-slate-100'
                  onClick={() => handleSort('manualmatched')}
                >
                  <div className='flex items-center gap-1'>
                    Manual Matched
                    <span className='text-xs'>
                      {getSortIcon('manualmatched')}
                    </span>
                  </div>
                </th>
                <th
                  className='px-6 py-3 cursor-pointer hover:bg-slate-100'
                  onClick={() => handleSort('unmatched')}
                >
                  <div className='flex items-center gap-1'>
                    Unmatched
                    <span className='text-xs'>{getSortIcon('unmatched')}</span>
                  </div>
                </th>
                <th className='px-6 py-3 text-center'>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData?.length > 0 ? (
                filteredAndSortedData.map((item) => (
                  <tr
                    key={item.id}
                    className='bg-white border-b border-slate-300 hover:bg-slate-50'
                  >
                    <td className='px-6 py-4 font-medium'>
                      {highlightSearchTerm(item.institution_name, searchTerm)}
                    </td>
                    <td className='px-6 py-4'>{item.completion_date}</td>
                    <td className='px-6 py-4 text-green-600'>
                      {formatNumber(item.auto_matched)}
                    </td>
                    <td className='px-6 py-4 text-blue-600'>
                      {formatNumber(item.manual_matched)}
                    </td>
                    <td className='px-6 py-4 text-red-600'>
                      {formatNumber(item.unmatched)}
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
                ))
              ) : (
                <tr>
                  <td
                    colSpan='8'
                    className='px-6 py-8 text-center text-gray-500'
                  >
                    <div className='flex flex-col items-center gap-2'>
                      <Search size={24} className='text-gray-300' />
                      <p>No records found matching your criteria</p>
                      <p className='text-xs'>
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Results Count */}
          <div className='ml-auto text-sm text-gray-600 mt-4'>
            Showing {filteredAndSortedData?.length} of {getTotalRecordCount()}{' '}
            records
          </div>
        </div>

        {/* Summary Stats */}
        {filteredAndSortedData?.length > 0 && (
          <div className='mt-6 pt-4 border-t border-gray-200'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 text-sm'>
              <div className='bg-blue-50 p-3 rounded-lg'>
                <p className='text-blue-600 font-medium'>Total Records</p>
                <p className='text-lg font-bold text-blue-800'>
                  {formatNumber(
                    filteredAndSortedData.reduce(
                      (sum, item) =>
                        sum +
                        (item.auto_matched || 0) +
                        (item.manual_matched || 0) +
                        (item.unmatched || 0),
                      0
                    )
                  )}
                </p>
              </div>
              <div className='bg-green-50 p-3 rounded-lg'>
                <p className='text-green-600 font-medium'>Total Matched</p>
                <p className='text-lg font-bold text-green-800'>
                  {formatNumber(
                    filteredAndSortedData.reduce(
                      (sum, item) =>
                        sum +
                        (item.auto_matched || 0) +
                        (item.manual_matched || 0),
                      0
                    )
                  )}
                </p>
              </div>
              <div className='bg-red-50 p-3 rounded-lg'>
                <p className='text-red-600 font-medium'>Total Unmatched</p>
                <p className='text-lg font-bold text-red-800'>
                  {formatNumber(
                    filteredAndSortedData.reduce(
                      (sum, item) => sum + (item.unmatched || 0),
                      0
                    )
                  )}
                </p>
              </div>
              <div className='bg-purple-50 p-3 rounded-lg'>
                <p className='text-purple-600 font-medium'>
                  Average Match Rate
                </p>
                <p className='text-lg font-bold text-purple-800'>
                  {filteredAndSortedData.length > 0
                    ? (
                        filteredAndSortedData.reduce((sum, item) => {
                          const totalRecords =
                            (item.auto_matched || 0) +
                              (item.manual_matched || 0) + 
                              (item.unmatched || 0);
                          const matched =
                            (item.auto_matched || 0) +
                            (item.manual_matched || 0);
                          return (
                            sum +
                            (totalRecords > 0
                              ? (matched / totalRecords) * 100
                              : 0)
                          );
                        }, 0) / filteredAndSortedData.length
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
