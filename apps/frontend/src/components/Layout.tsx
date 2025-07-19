import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { EnhancedSidebar } from './EnhancedSidebar';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { qaName, userRole, logout } = useAuth();
  
  // Get the initials from the QA name for the avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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
        {/* Header */}
        <header className="h-16 flex items-center px-4 border-b border-border/50 shrink-0 bg-background/95 backdrop-blur-sm sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-accent/50 transition-colors duration-200"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="ml-auto flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              className="hidden sm:flex hover:bg-accent/50 transition-all duration-200"
            >
              Documentation
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all duration-200">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {getInitials(qaName)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{qaName}</p>
                  <p className="text-xs text-muted-foreground">{userRole}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={logout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto min-w-0">
          <div className="h-full w-full">
            <Outlet />
          </div>
        </main>
        </div>
      </div>
      <Toaster />
    </div>
  );
};
