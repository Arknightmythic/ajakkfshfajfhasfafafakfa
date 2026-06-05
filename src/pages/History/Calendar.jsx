import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Move,
} from 'lucide-react';

const RangeCalendarFilter = ({
  onDateChange,
  startDate: propStartDate,
  endDate: propEndDate,
}) => {
  const [startDate, setStartDate] = useState(propStartDate);
  const [endDate, setEndDate] = useState(propEndDate);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isPrevDisabled, setIsPrevDisabled] = useState(false);
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectingStart, setSelectingStart] = useState(true);
  const containerRef = useRef(null);
  const modalRef = useRef(null);

  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    // const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const isInRange = (date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const handleDateClick = (date) => {
    if (selectingStart) {
      setStartDate(date);
      setEndDate(null);
      setSelectingStart(false);
    } else {
      if (date < startDate) {
        setStartDate(date);
        setEndDate(startDate);
      } else {
        setEndDate(date);
      }
      setSelectingStart(true);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);

    // Define minimum and maximum dates
    const minDate = new Date('2020-01-01'); 
    const maxDate = new Date();

    // Check boundaries before updating
    if (newMonth <= minDate) {
      setIsPrevDisabled(true);
      return; // Prevent navigation
    }
    if (newMonth > maxDate) {
      setIsNextDisabled(true);
      return; // Prevent navigation
    }

    // Update state if within bounds
    setCurrentMonth(newMonth);
    setIsPrevDisabled(newMonth <= minDate);
    setIsNextDisabled(newMonth >= maxDate);
  };

  // Update button states on initial render and month change
  useEffect(() => {
    const minDate = new Date('2020-01-01');
    const maxDate = new Date();
    setIsPrevDisabled(currentMonth <= minDate);
    setIsNextDisabled(currentMonth >= maxDate);
  }, [currentMonth]);

  const clearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectingStart(true);
    if (onDateChange) {
      onDateChange(null, null);
    }
  };

  const applyFilter = () => {
    if (onDateChange && startDate && endDate) {
      onDateChange(startDate, endDate);
    }
    setIsOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Sync with props when they change
  React.useEffect(() => {
    setStartDate(propStartDate);
    setEndDate(propEndDate);
  }, [propStartDate, propEndDate]);

  // Handle click outside to close calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Reset modal position when opening
  useEffect(() => {
    if (isOpen) {
      setModalPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const days = getDaysInMonth(currentMonth);
  const hasValidRange = startDate && endDate;

  return (
    <div className='relative' ref={containerRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer'
      >
        <Calendar className='w-4 h-4 text-gray-500' />
        <span className='text-sm'>
          {hasValidRange
            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
            : 'Select date range'}
        </span>
        <Filter className='w-4 h-4 text-gray-400 cursor-pointer' />
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div
          ref={modalRef}
          className='fixed z-30 bg-white border border-gray-200 rounded-lg shadow-xl'
          style={{
            left:
              modalPosition.x ||
              containerRef.current?.getBoundingClientRect().left ||
              0,
            top:
              modalPosition.y ||
              containerRef.current?.getBoundingClientRect().bottom + 8 ||
              0,
            width: '320px',
          }}
        >
          <div className='p-4'>
            {/* Month Navigation Header */}
            <div className='flex items-center justify-between mb-4'>
              <button
                onClick={() => navigateMonth(-1)}
                disabled={isPrevDisabled}
                className={`p-1 hover:bg-gray-100 rounded ${
                  isPrevDisabled ? 'cursor-not-allowed' : ''
                }`}
              >
                <ChevronLeft
                  className={`w-5 h-5 ${
                    isPrevDisabled ? 'text-slate-300' : ''
                  }`}
                />
              </button>
              <div className='flex gap-2'>
                <select
                  value={currentMonth.getMonth()}
                  onChange={(e) => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setMonth(parseInt(e.target.value));
                    setCurrentMonth(newMonth);
                  }}
                  className='px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  value={currentMonth.getFullYear()}
                  onChange={(e) => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setFullYear(parseInt(e.target.value));
                    setCurrentMonth(newMonth);
                  }}
                  className='px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                >
                  {Array.from({ length: 6 }, (_, i) => {
                    const year = 2020 + i; // Starts at 2020 and increments to 2025
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <button
                onClick={() => navigateMonth(1)}
                disabled={isNextDisabled}
                className={`p-1 hover:bg-gray-100 rounded ${
                  isNextDisabled ? 'cursor-not-allowed' : ''
                }`}
              >
                <ChevronRight className={`w-5 h-5 ${isNextDisabled ? 'text-slate-300':''}`} />
              </button>
            </div>

            {/* Selection Info */}
            <div className='mb-3 text-sm text-gray-600'>
              {selectingStart ? 'Select start date' : 'Select end date'}
            </div>

            {/* Calendar Grid */}
            <div className='grid grid-cols-7 gap-1 mb-4'>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div
                  key={day}
                  className='text-center text-xs font-medium text-gray-500 py-2'
                >
                  {day}
                </div>
              ))}

              {days.map((date, index) => {
                const isCurrentMonth =
                  date.getMonth() === currentMonth.getMonth();
                const isStart = isSameDay(date, startDate);
                const isEnd = isSameDay(date, endDate);
                const inRange = isInRange(date);

                // Date restrictions - FIXED: Create date objects for proper comparison
                const minDate = new Date('2020-01-01');
                minDate.setHours(0, 0, 0, 0); // Set to start of min date

                const today = new Date();
                today.setHours(23, 59, 59, 999); // Set to end of today

                // Create a copy of the date for comparison (without time)
                const compareDate = new Date(date);
                compareDate.setHours(0, 0, 0, 0);

                const isBeforeMinDate = compareDate < minDate;
                const isAfterToday = compareDate > today;
                const isDisabled = isBeforeMinDate || isAfterToday;

                // Determine if this date can be clicked
                const canClick = isCurrentMonth && !isDisabled;

                return (
                  <button
                    key={index}
                    onClick={() => canClick && handleDateClick(date)}
                    disabled={!canClick}
                    className={`
                      w-8 h-8 text-sm rounded-md transition-colors
                      ${
                        !isCurrentMonth
                          ? 'text-gray-300 cursor-not-allowed'
                          : isDisabled
                          ? 'text-red-300 cursor-not-allowed line-through'
                          : 'text-gray-700 hover:bg-blue-100 cursor-pointer'
                      }
                      ${
                        isStart || isEnd
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : inRange && !isDisabled
                          ? 'bg-blue-100 text-blue-700'
                          : ''
                      }
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Selected Range Display */}
            {hasValidRange && (
              <div className='mb-3 p-2 bg-blue-50 rounded text-sm'>
                <div className='font-medium text-blue-900'>Selected Range:</div>
                <div className='text-blue-700'>
                  {formatDate(startDate)} to {formatDate(endDate)}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex gap-2'>
              <button
                onClick={clearFilter}
                className='flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500'
              >
                Clear
              </button>
              <button
                onClick={applyFilter}
                disabled={!hasValidRange}
                className='flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed'
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RangeCalendarFilter;