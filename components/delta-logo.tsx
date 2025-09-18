'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DeltaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export function DeltaLogo({ size = 'md', animated = true, className = '' }: DeltaLogoProps) {
  const logoVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.05, 
      rotate: 5,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const pulseVariants = {
    initial: { scale: 1, opacity: 1 },
    animate: { 
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: { 
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        repeatDelay: 1
      }
    }
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className} relative`}
      variants={animated ? logoVariants : undefined}
      initial="initial"
      whileHover={animated ? "hover" : undefined}
      whileTap={animated ? "tap" : undefined}
    >
      {/* Main Delta Symbol */}
      <div className="relative w-full h-full">
        {/* Background Circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-delta-500 to-delta-600 shadow-delta" />
        
        {/* Animated Pulse Ring */}
        {animated && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-delta-400/30"
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          />
        )}
        
        {/* Delta Symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-3/4 h-3/4 text-white"
          >
            <path
              d="M12 2L22 20H2L12 2Z"
              fill="currentColor"
              className="drop-shadow-sm"
            />
          </svg>
        </div>
        
        {/* Plus Symbol */}
        <div className="absolute -bottom-1 -right-1 w-1/3 h-1/3 bg-cricbuzz-500 rounded-full flex items-center justify-center shadow-lg">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-2/3 h-2/3 text-white"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

export function CricbuzzLogo({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img
        src="https://static.cricbuzz.com/images/cb_logo.svg"
        alt="Cricbuzz"
        className="w-full h-full object-contain filter dark:brightness-0 dark:invert"
        loading="lazy"
      />
    </div>
  );
}
