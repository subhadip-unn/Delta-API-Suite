
import { ReportJob } from './types';

interface JobTabsProps {
  jobs: ReportJob[];
  selectedJobIndex: number;
  onSelectJob: (index: number) => void;
}

const JobTabs = ({ jobs, selectedJobIndex, onSelectJob }: JobTabsProps) => {
  return (
    <div 
      className="sticky top-0 z-10 bg-white shadow-sm flex flex-wrap p-2 border-b border-gray-200" 
      style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        flexWrap: 'wrap',
        padding: '10px',
        borderBottom: '1px solid #ddd'
      }}
    >
      {jobs.map((job, idx) => (
        <button
          key={idx}
          onClick={() => onSelectJob(idx)}
          className={`mr-2 p-2 rounded text-sm ${selectedJobIndex === idx ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          style={{
            background: selectedJobIndex === idx ? '#3498db' : '#f0f0f0',
            border: 'none',
            padding: '8px 15px',
            marginRight: '5px',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: selectedJobIndex === idx ? 'white' : 'inherit'
          }}
        >
          {job.jobName}
        </button>
      ))}
    </div>
  );
};

export default JobTabs;
