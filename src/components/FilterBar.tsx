import React, { useState, ChangeEvent } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
}

interface SortOption {
  id: string;
  label: string;
  direction: 'asc' | 'desc';
}

interface FilterBarProps {
  onSearch: (query: string) => void;
  onFilter?: (filterId: string) => void;
  onSort?: (sortId: string, direction: 'asc' | 'desc') => void;
  filterOptions?: FilterOption[];
  sortOptions?: SortOption[];
  placeholder?: string;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  onSearch,
  onFilter,
  onSort,
  filterOptions = [],
  sortOptions = [],
  placeholder = 'Rechercher...',
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeSort, setActiveSort] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterClick = (filterId: string) => {
    const newFilter = activeFilter === filterId ? null : filterId;
    setActiveFilter(newFilter);
    onFilter?.(newFilter || '');
  };

  const handleSortClick = (sortId: string) => {
    if (activeSort === sortId) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      onSort?.(sortId, newDirection);
    } else {
      setActiveSort(sortId);
      setSortDirection('asc');
      onSort?.(sortId, 'asc');
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-soft-brown/60" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-2 border border-[#F5E8C7] rounded-lg text-soft-brown placeholder-[#D2B48C]/60 bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:border-soft-green"
        />
      </div>
      {filterOptions.length > 0 && (
        <div className="relative inline-block">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-[#F5E8C7] rounded-lg bg-[#F5F5F5] text-soft-brown hover:bg-light-beige/30 focus:outline-none focus:ring-2 focus:ring-[#A8D5BA]"
          >
            <Filter className="h-4 w-4 mr-2" />
            <span>Filtrer</span>
          </button>
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#F5F5F5] ring-1 ring-[#F5E8C7] z-10 hidden group-hover:block">
            <div className="py-1" role="menu" aria-orientation="vertical">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleFilterClick(option.id)}
                  className={`block w-full text-left px-4 py-2 text-sm ${activeFilter === option.id ? 'bg-light-beige text-soft-brown' : 'text-soft-brown hover:bg-light-beige/30'}`}
                  role="menuitem"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {sortOptions.length > 0 && (
        <div className="relative inline-block">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-[#F5E8C7] rounded-lg bg-[#F5F5F5] text-soft-brown hover:bg-light-beige/30 focus:outline-none focus:ring-2 focus:ring-[#A8D5BA]"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <span>Trier</span>
          </button>
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#F5F5F5] ring-1 ring-[#F5E8C7] z-10 hidden group-hover:block">
            <div className="py-1" role="menu" aria-orientation="vertical">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSortClick(option.id)}
                  className={`block w-full text-left px-4 py-2 text-sm ${activeSort === option.id ? 'bg-light-beige text-soft-brown' : 'text-soft-brown hover:bg-light-beige/30'}`}
                  role="menuitem"
                >
                  {option.label} {activeSort === option.id && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;