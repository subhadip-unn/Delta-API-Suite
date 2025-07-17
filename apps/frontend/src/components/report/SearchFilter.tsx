
import { Search, AlertCircle, AlertTriangle, AlertOctagon, Check } from 'lucide-react';
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
        <Search 
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" 
          size={16} 
          style={{ color: '#95a5a6' }}
        />
        <Input
          id="endpointSearch"
          type="text"
          placeholder="Search by endpoint, key or diff path…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-4 py-2 border border-gray-300 rounded w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          style={{
            paddingLeft: '2.25rem',
            paddingRight: '1rem',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '0.9rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            height: '38px',
            transition: 'all 0.2s ease'
          }}
        />
      </div>

      <div className="flex gap-1">
        <button
          id="showAll"
          onClick={() => onFilterChange('all')}
          className={`filter-btn px-3 py-2 rounded text-sm flex items-center gap-1 ${activeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          style={{
            backgroundColor: activeFilter === 'all' ? '#3498db' : '#f5f5f5',
            color: activeFilter === 'all' ? 'white' : '#555',
            border: activeFilter === 'all' ? 'none' : '1px solid #e0e0e0',
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: activeFilter === 'all' ? 600 : 400,
            boxShadow: activeFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            minWidth: '80px',
            justifyContent: 'center'
          }}
        >
          <Check size={14} style={{ opacity: activeFilter === 'all' ? 1 : 0.5 }} />
          All
        </button>
        <button
          id="showErrors"
          onClick={() => onFilterChange('errors')}
          className={`filter-btn px-3 py-2 rounded text-sm flex items-center gap-1 ${activeFilter === 'errors' ? 'bg-red-500 text-white' : 'bg-gray-100'}`}
          style={{
            backgroundColor: activeFilter === 'errors' ? '#e74c3c' : '#fdedee',
            color: activeFilter === 'errors' ? 'white' : '#e74c3c',
            border: activeFilter === 'errors' ? 'none' : '1px solid #fadcdc',
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: activeFilter === 'errors' ? 600 : 400,
            boxShadow: activeFilter === 'errors' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            minWidth: '80px',
            justifyContent: 'center'
          }}
        >
          <AlertOctagon size={14} style={{ opacity: activeFilter === 'errors' ? 1 : 0.7 }} />
          Errors
        </button>
        <button
          id="showWarnings"
          onClick={() => onFilterChange('warnings')}
          className={`filter-btn px-3 py-2 rounded text-sm flex items-center gap-1 ${activeFilter === 'warnings' ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}
          style={{
            backgroundColor: activeFilter === 'warnings' ? '#f39c12' : '#fff8e6',
            color: activeFilter === 'warnings' ? 'white' : '#f39c12',
            border: activeFilter === 'warnings' ? 'none' : '1px solid #faecd2',
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: activeFilter === 'warnings' ? 600 : 400,
            boxShadow: activeFilter === 'warnings' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            minWidth: '80px',
            justifyContent: 'center'
          }}
        >
          <AlertTriangle size={14} style={{ opacity: activeFilter === 'warnings' ? 1 : 0.7 }} />
          Warnings
        </button>
        <button
          id="showFail"
          onClick={() => onFilterChange('failures')}
          className={`filter-btn px-3 py-2 rounded text-sm flex items-center gap-1 ${activeFilter === 'failures' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}
          style={{
            backgroundColor: activeFilter === 'failures' ? '#9b59b6' : '#f9eefa',
            color: activeFilter === 'failures' ? 'white' : '#9b59b6',
            border: activeFilter === 'failures' ? 'none' : '1px solid #ebdaee',
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: activeFilter === 'failures' ? 600 : 400,
            boxShadow: activeFilter === 'failures' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            minWidth: '80px',
            justifyContent: 'center'
          }}
        >
          <AlertCircle size={14} style={{ opacity: activeFilter === 'failures' ? 1 : 0.7 }} />
          Failures
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;
