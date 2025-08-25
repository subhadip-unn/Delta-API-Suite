import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

import { Toaster } from '@/components/ui/toaster';
import { EnhancedSidebar } from './EnhancedSidebar';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false); // Close mobile sidebar on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Sidebar - Always Fixed Position */}
      <EnhancedSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        onCollapseChange={setSidebarCollapsed}
        className="transition-all duration-300 ease-in-out"
      />

      {/* Main content area - With proper margin for fixed sidebar */}
      <div className={cn(
        "min-h-screen transition-all duration-300 ease-in-out",
        "lg:ml-64", // Default sidebar width (256px)
        sidebarCollapsed && "lg:ml-16" // Collapsed sidebar width (64px)
      )}>
        <div className="flex flex-col min-h-screen">


        {/* Page content */}
        <main className="flex-1 min-w-0">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
        </div>
      </div>
      <Toaster />
    </div>
  );
};
