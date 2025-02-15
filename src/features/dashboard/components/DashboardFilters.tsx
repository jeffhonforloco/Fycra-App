import React from 'react';
import { FilterOptions } from '../types';
import { Filter, SortAsc, SortDesc } from 'lucide-react';

interface DashboardFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export default function DashboardFilters({ filters, onFilterChange }: DashboardFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={filters.timeframe}
            onChange={(e) => onFilterChange({ ...filters, timeframe: e.target.value as FilterOptions['timeframe'] })}
            className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as FilterOptions['status'] })}
            className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={filters.sort}
            onChange={(e) => onFilterChange({ ...filters, sort: e.target.value as FilterOptions['sort'] })}
            className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          >
            <option value="date">Date</option>
            <option value="impressions">Impressions</option>
            <option value="clicks">Clicks</option>
            <option value="ctr">CTR</option>
          </select>

          <button
            onClick={() => onFilterChange({
              ...filters,
              order: filters.order === 'asc' ? 'desc' : 'asc'
            })}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            {filters.order === 'asc' ? (
              <SortAsc className="w-5 h-5" />
            ) : (
              <SortDesc className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}