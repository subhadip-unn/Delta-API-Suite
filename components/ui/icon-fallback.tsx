import React from 'react';

interface IconFallbackProps {
  className?: string;
  children?: React.ReactNode;
}

export const IconFallback: React.FC<IconFallbackProps> = ({ className = "w-4 h-4", children }) => {
  return (
    <div className={className} role="img" aria-label="icon">
      {children || "⚡"}
    </div>
  );
};
