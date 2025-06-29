
import { Search } from 'lucide-react';
import { FilterType } from './types';
import { Input } from '../../components/ui/input';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const SearchFilter = ({ 
  searchQuery, 
  onSearchChange, 
  activeFilter, 
  onFilterChange 
}: SearchFilterProps) => {
  return (
    <div 
      className="search-filter-container flex flex-wrap justify-between gap-4 mb-4"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1rem'
      }}
    >
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          id="endpointSearch"
          type="text"
          placeholder="Search by key or JSON path…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-4 py-2 border border-gray-300 rounded w-full"
          style={{
            paddingLeft: '2.25rem',
            paddingRight: '1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        />
      </div>

      <div className="flex gap-1">
        <button
          id="showAll"
          onClick={() => onFilterChange('all')}
          className={`filter-btn px-3 py-2 rounded text-sm ${activeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          style={{
            backgroundColor: activeFilter === 'all' ? '#1976d2' : '#e0e0e0',
            color: activeFilter === 'all' ? 'white' : 'inherit',
            border: 'none',
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          All
        </button>
        <button
          id="showErrors"
          onClick={() => onFilterChange('errors')}
          className={`filter-btn px-3 py-2 rounded text-sm ${activeFilter === 'errors' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          style={{
            backgroundColor: activeFilter === 'errors' ? '#1976d2' : '#e0e0e0',
            color: activeFilter === 'errors' ? 'white' : 'inherit',
            border: 'none',
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Errors
        </button>
        <button
          id="showWarnings"
          onClick={() => onFilterChange('warnings')}
          className={`filter-btn px-3 py-2 rounded text-sm ${activeFilter === 'warnings' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          style={{
            backgroundColor: activeFilter === 'warnings' ? '#1976d2' : '#e0e0e0',
            color: activeFilter === 'warnings' ? 'white' : 'inherit',
            border: 'none',
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Warnings
        </button>
        <button
          id="showFail"
          onClick={() => onFilterChange('failures')}
          className={`filter-btn px-3 py-2 rounded text-sm ${activeFilter === 'failures' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          style={{
            backgroundColor: activeFilter === 'failures' ? '#1976d2' : '#e0e0e0',
            color: activeFilter === 'failures' ? 'white' : 'inherit',
            border: 'none',
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Failures
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;
