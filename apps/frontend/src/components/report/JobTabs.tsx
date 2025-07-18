
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
      {/* Platform order: iOS, Android, Mobile-Web, Desktop-Web */}
      {['i', 'a', 'm', 'w'].map((platform) => {
        // Find job for this platform
        const jobIdx = jobs.findIndex(j => j.platform === platform);
        let label = '';
        if (platform === 'i') label = 'iOS: Stg vs Prod (explicit pairs)';
        if (platform === 'a') label = 'Android: Stg vs Prod (explicit pairs)';
        if (platform === 'm') label = 'Mobile-Web: Stg vs Prod (explicit pairs)';
        if (platform === 'w') label = 'Desktop-Web: Stg vs Prod (explicit pairs)';
        return (
          <button
            key={platform}
            onClick={() => jobIdx !== -1 && onSelectJob(jobIdx)}
            className={`mr-2 p-2 rounded text-sm ${selectedJobIndex === jobIdx ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'} ${jobIdx === -1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              background: selectedJobIndex === jobIdx ? '#3498db' : '#f0f0f0',
              border: 'none',
              padding: '8px 15px',
              marginRight: '5px',
              borderRadius: '4px',
              cursor: jobIdx === -1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              color: selectedJobIndex === jobIdx ? 'white' : 'inherit',
              fontWeight: selectedJobIndex === jobIdx ? 'bold' : 'normal',
              minWidth: '215px',
            }}
            disabled={jobIdx === -1}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default JobTabs;
