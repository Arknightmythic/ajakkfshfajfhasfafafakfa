import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Download,
  FileText,
  Calendar,
  Loader2,
  Filter,
} from 'lucide-react';
import RangeCalendarFilter from './Calendar';
import useHistory from './hooks/useHistory';
import useDownload from './hooks/useDownload';
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

  const { downloadFile, loadingDownload } = useDownload();

  const handleDownloadMatched = (item) => {
    downloadFile('match', item.metadata_id, 'csv', item.institution_name);
  };

  const handleDownloadUnmatched = (item) => {
    downloadFile('unmatch', item.metadata_id, 'csv', item.institution_name);
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
    let dataArray = [];
    if (historyData) {
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
        return [];
      }
    }

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return [];
    }

    let filtered = dataArray;
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.institution_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.completed_date.split('T')[0]);
        const startDate = new Date(dateFilter.startDate);
        const endDate = new Date(dateFilter.endDate);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((item) => {
        switch (statusFilter) {
          case 'matched':
            return (
              (item.auto_match_count || 0) > 0 || (item.manual_match_count || 0) > 0
            );
          case 'unmatched':
            return (item.unmatched || 0) > 0;
          case 'auto-matched':
            return (item.auto_match_count || 0) > 0;
          case 'manual-matched':
            return (item.manual_match_count || 0) > 0;
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.completed_date.split('T')[0]);
          bValue = new Date(b.completed_date.split('T')[0]);
          break;
        case 'institution_name':
          aValue = (a.institution_name || '').toLowerCase();
          bValue = (b.institution_name || '').toLowerCase();
          break;
        case 'automatched':
          aValue = a.auto_match_count || 0;
          bValue = b.auto_match_count || 0;
          break;
        case 'manualmatched':
          aValue = a.manual_match_count || 0;
          bValue = b.manual_match_count || 0;
          break;
        case 'unmatched':
          aValue = a.unmatch_count || 0;
          bValue = b.unmatch_count || 0;
          break;
        case 'unmatch_percentage':
          aValue = a.unmatch_percentage || 0;
          bValue = b.unmatch_percentage || 0;
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

  const highlightSearchTerm = (text, searchTerm, highlight = true) => {
    if (!text || !searchTerm?.trim() || !highlight) return text || '';

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

  return (
    <div
      id='historyPage'
      className={`relative ${loadingDownload ? 'cursor-progress' : ''}`}
    >
      <div className='bg-white p-6 rounded-xl shadow-sm'>
        <div className='mb-6 space-y-4'>
          <div className='flex flex-wrap gap-4 items-center justify-between'>
            <div className='flex flex-row gap-3'>
              <div className='flex items-center gap-2'>
                <Filter size={16} className='text-gray-500' />
                <span className='text-sm font-medium text-gray-700'>
                  Filters:
                </span>
              </div>
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
          <div className='max-h-[500px] overflow-y-auto'>
            <table className='w-full text-sm text-left'>
              <thead className='text-xs text-slate-500 uppercase bg-slate-50'>
                <tr>
                  <th
                    className='px-6 py-3'
                    // onClick={() => handleSort('institution_name')}
                  >
                    <div className='flex items-center gap-1'>
                      Ministry/Institution
                      {/* <span className='text-xs'>
                        {getSortIcon('institution_name')}
                      </span> */}
                    </div>
                  </th>
                  <th
                    className='px-6 py-3'
                    // onClick={() => handleSort('date')}
                  >
                    <div className='flex items-center gap-1'>
                      Completion Date
                      {/* <span className='text-xs'>{getSortIcon('date')}</span> */}
                    </div>
                  </th>
                  <th
                    className='px-6 py-3'
                    // onClick={() => handleSort('automatched')}
                  >
                    <div className='flex items-center gap-1'>
                      Auto Matched
                      {/* <span className='text-xs'>
                        {getSortIcon('automatched')}
                      </span> */}
                    </div>
                  </th>
                  <th
                    className='px-6 py-3'
                    // onClick={() => handleSort('manualmatched')}
                  >
                    <div className='flex items-center gap-1'>
                      Manual Matched
                      {/* <span className='text-xs'>
                        {getSortIcon('manualmatched')}
                      </span> */}
                    </div>
                  </th>
                  <th
                    className='px-6 py-3'
                    // onClick={() => handleSort('unmatched')}
                  >
                    <div className='flex items-center gap-1'>
                      Unmatched
                      {/* <span className='text-xs'>{getSortIcon('unmatched')}</span> */}
                    </div>
                  </th>
                  <th
                    className='px-6 py-3'
                    // onClick={() => handleSort('unmatch_percentage')}
                  >
                    <div className='flex items-center gap-1 whitespace-nowrap'>
                      % Unmatched
                      {/* <span className='text-xs'>{getSortIcon('unmatch_percentage')}</span> */}
                    </div>
                  </th>
                  <th className='px-6 py-3 text-center'>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedData?.length > 0 ? (
                  filteredAndSortedData.map((item) => (
                    <tr
                      key={item.metadata_id}
                      className='bg-white border-b border-slate-300 hover:bg-slate-50'
                    >
                      <td className='px-6 py-4'>
                        {highlightSearchTerm(
                          item.institution_name,
                          searchTerm,
                          false
                        )}
                      </td>
                      <td className='px-6 py-4'>
                        {item.completed_date.split('T')[0]}
                      </td>
                      <td className='px-6 py-4 text-green-600'>
                        {formatNumber(item.auto_match_count)}
                      </td>
                      <td className='px-6 py-4 text-blue-600'>
                        {formatNumber(item.manual_match_count)}
                      </td>
                      <td className='px-6 py-4 text-red-600'>
                        {formatNumber(item.unmatch_count)}
                      </td>
                      <td className='px-6 py-4 text-red-600'>
                        {formatNumber(item.unmatch_percentage)}%
                      </td>
                      <td className='flex px-6 py-4 text-center space-x-2'>
                        <button
                          onClick={() => handleDownloadMatched(item)}
                          className={`bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 text-xs whitespace-nowrap cursor-pointer ${
                            loadingDownload ? 'cursor-progress' : ''
                          }`}
                        >
                          Download Matched
                        </button>
                        <button
                          onClick={() => handleDownloadUnmatched(item)}
                          className={`bg-slate-500 text-white px-2 py-1 rounded-md hover:bg-slate-600 text-xs whitespace-nowrap cursor-pointer ${
                            loadingDownload ? 'cursor-progress' : ''
                          }`}
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
          </div>
          <div className='ml-auto text-sm text-gray-600 mt-4'>
            Showing {filteredAndSortedData?.length} of {getTotalRecordCount()}{' '}
            records
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;