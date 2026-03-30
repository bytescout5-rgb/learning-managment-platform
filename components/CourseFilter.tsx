'use client';

import { useState, useEffect, useCallback } from 'react';

interface Course {
  id: string;
  title: string;
  category: string;
  level: string;
}

interface CourseFilterProps {
  onFilterChange: (filters: FilterState) => void;
  courses: Course[];
}

interface FilterState {
  category: string;
  level: string;
  searchTerm: string;
}

export default function CourseFilter({ onFilterChange, courses }: CourseFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    level: '',
    searchTerm: '',
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);

  // Extract unique categories and levels from courses
  useEffect(() => {
    const uniqueCategories = Array.from(new Set(courses.map((c) => c.category)));
    const uniqueLevels = Array.from(new Set(courses.map((c) => c.level)));
    setCategories(uniqueCategories);
    setLevels(uniqueLevels);
  }, [courses]);

  // Debounced filter change handler
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [onFilterChange]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange({ ...filters, category: e.target.value });
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange({ ...filters, level: e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange({ ...filters, searchTerm: e.target.value });
  };

  const handleReset = () => {
    const emptyFilters: FilterState = { category: '', level: '', searchTerm: '' };
    handleFilterChange(emptyFilters);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Filter Courses</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium mb-2">
            Search
          </label>
          <input
            id="search"
            type="text"
            value={filters.searchTerm}
            onChange={handleSearchChange}
            placeholder="Search courses..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            Category
          </label>
          <select
            id="category"
            value={filters.category}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div>
          <label htmlFor="level" className="block text-sm font-medium mb-2">
            Level
          </label>
          <select
            id="level"
            value={filters.level}
            onChange={handleLevelChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Levels</option>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}