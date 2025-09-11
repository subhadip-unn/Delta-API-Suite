import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  onTransitionComplete?: () => void;
  direction?: 'in' | 'out';
  duration?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  onTransitionComplete, 
  direction = 'in',
  duration = 0.6 
}) => {

  const variants = {
    in: {
      initial: { opacity: 0, y: 50, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -50, scale: 0.95 }
    },
    out: {
      initial: { opacity: 1, y: 0, scale: 1 },
      animate: { opacity: 0, y: -50, scale: 0.95 },
      exit: { opacity: 0, y: -100, scale: 0.9 }
    }
  };

  return (
    <motion.div
      initial={variants[direction].initial}
      animate={variants[direction].animate}
      exit={variants[direction].exit}
      transition={{
        duration,
        ease: [0.4, 0.0, 0.2, 1],
        staggerChildren: 0.1
      }}
      onAnimationComplete={onTransitionComplete}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

// Special transition for login to dashboard
export const LoginToDashboardTransition = () => {
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    setShowTransition(true);
  }, []);

  if (!showTransition) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center space-y-8">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
          className="mx-auto"
        >
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="text-white"
            >
              <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </motion.div>
            
            {/* Floating Corner */}
            <motion.div
              animate={{ 
                rotate: [0, 15, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-2 right-2 w-4 h-4 bg-yellow-400 rounded-sm shadow-lg"
            />
          </div>
        </motion.div>

        {/* Transition Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="space-y-4"
        >
          <h1 className="text-4xl font-bold text-white">
            Welcome to Delta Suite!
          </h1>
          <p className="text-lg text-slate-300">
            Redirecting to your dashboard...
          </p>
        </motion.div>

        {/* Loading Dots */}
        <motion.div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: 'easeInOut'
              }}
              className="w-3 h-3 rounded-full bg-purple-400"
            />
          ))}
        </motion.div>

        {/* Version Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-sm text-slate-400"
        >
          Delta API Suite v2.1.0
        </motion.div>
      </div>
    </motion.div>
  );
};
