import { motion } from 'framer-motion';

// Unified Delta Logo System
interface DeltaLogoProps {
  tool: 'deltapro' | 'deltametrics' | 'deltadb' | 'generic';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'full' | 'minimal';
  className?: string;
}

export const DeltaLogo: React.FC<DeltaLogoProps> = ({ 
  tool, 
  size = 'md', 
  variant = 'icon',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  // Tool-specific configurations
  const toolConfigs = {
    deltapro: {
      name: 'DeltaPro+',
      description: 'API Comparison',
      colors: 'from-blue-500 to-purple-600',
      icon: (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    deltametrics: {
      name: 'DeltaMetrics',
      description: 'System Analytics',
      colors: 'from-blue-500 to-cyan-500',
      icon: (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
          <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="9" cy="11" r="2" fill="currentColor"/>
          <circle cx="13" cy="15" r="2" fill="currentColor"/>
          <circle cx="21" cy="7" r="2" fill="currentColor"/>
        </svg>
      )
    },
    deltadb: {
      name: 'DeltaDB',
      description: 'Data Storage',
      colors: 'from-green-500 to-emerald-600',
      icon: (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M3 9H21" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 21V9" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="15" r="2" fill="currentColor"/>
        </svg>
      )
    },
    generic: {
      name: 'Delta Suite',
      description: 'API Development',
      colors: 'from-purple-500 to-pink-500',
      icon: (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
          {/* Delta Triangle Symbol */}
          <path d="M12 2L2 22L22 22L12 2Z" fill="currentColor"/>
          {/* Inner accent line */}
          <path d="M12 6L6 20L18 20L12 6Z" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
        </svg>
      )
    }
  };

  const config = toolConfigs[tool];

  if (variant === 'icon') {
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br ${config.colors} rounded-xl shadow-lg flex items-center justify-center text-white ${className}`}>
        {config.icon}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`${sizeClasses[size]} bg-gradient-to-br ${config.colors} rounded-xl shadow-lg flex items-center justify-center text-white`}>
          {config.icon}
        </div>
        <span className={`font-bold bg-gradient-to-r ${config.colors} bg-clip-text text-transparent ${textSizes[size]}`}>
          {config.name}
        </span>
      </div>
    );
  }

  // Full variant
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br ${config.colors} rounded-xl shadow-lg flex items-center justify-center text-white relative overflow-hidden`}>
        {config.icon}
        {/* Subtle floating corner */}
        <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-sm opacity-80" />
      </div>
      <div className="flex flex-col">
        <span className={`font-bold bg-gradient-to-r ${config.colors} bg-clip-text text-transparent ${textSizes[size]}`}>
          {config.name}
        </span>
        <span className="text-xs text-muted-foreground font-medium">
          {config.description}
        </span>
      </div>
    </div>
  );
};

// Subtle Loading Component
interface SubtleLoadingProps {
  tool: 'deltapro' | 'deltametrics' | 'deltadb' | 'generic';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SubtleLoading: React.FC<SubtleLoadingProps> = ({ 
  tool, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-20 h-20'
  };

  const config = {
    deltapro: { colors: 'from-blue-500 to-purple-600', name: 'DeltaPro+' },
    deltametrics: { colors: 'from-blue-500 to-cyan-500', name: 'DeltaMetrics' },
    deltadb: { colors: 'from-green-500 to-emerald-600', name: 'DeltaDB' },
    generic: { colors: 'from-purple-500 to-pink-500', name: 'Delta Suite' }
  }[tool];

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {/* Subtle animated logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`${sizeClasses[size]} bg-gradient-to-br ${config.colors} rounded-xl shadow-lg flex items-center justify-center text-white relative overflow-hidden`}
      >
        <DeltaLogo tool={tool} size={size} variant="icon" />
        
        {/* Subtle pulse animation */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-white/20 rounded-xl"
        />
      </motion.div>

      {/* Tool name */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-lg font-semibold text-foreground"
      >
        {config.name}
      </motion.h2>

      {/* Subtle loading dots */}
      <motion.div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              delay: i * 0.2,
              ease: 'easeInOut'
            }}
            className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full"
          />
        ))}
      </motion.div>
    </div>
  );
};
