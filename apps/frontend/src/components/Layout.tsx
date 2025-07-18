import { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, LayoutDashboard, Settings, BarChart, Upload } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { qaName, userRole, logout } = useAuth();
  const location = useLocation();
  
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar for larger screens and overlay for mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-4 border-b border-border">
          <span className="text-lg font-semibold">CBZ Delta</span>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4 space-y-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn(
                "flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink
            to="/config"
            className={({ isActive }) =>
              cn(
                "flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Settings className="mr-2 h-4 w-4" />
            Config
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              cn(
                "flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <BarChart className="mr-2 h-4 w-4" />
            Reports
          </NavLink>
          <NavLink
            to="/upload"
            className={({ isActive }) =>
              cn(
                "flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Report
          </NavLink>
          <Link
            to="/json-diff"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname === '/json-diff'
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <div className="mr-3 h-4 w-4 relative">
              <div className="absolute inset-0 animate-pulse">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z" opacity="0.3"/>
                  <path d="M12 2L22 7v10c0 5.55-3.84 10-9 10s-9-4.45-9-10V7l10-5z"/>
                </svg>
              </div>
              <div className="absolute inset-0 animate-spin" style={{animationDuration: '3s'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z"/>
                </svg>
              </div>
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
              DeltaPro+
            </span>
          </Link>
        </nav>

        {/* Sidebar Footer with Dark Mode Toggle */}
        <div className="absolute bottom-0 w-full p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dark:text-yellow-400 text-slate-400">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
              <span className="text-sm font-medium dark:hidden">Light</span>
              <span className="text-sm font-medium hidden dark:block">Dark</span>
            </div>
            <div className="flex items-center space-x-2">
              <label className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  onChange={() => document.documentElement.classList.toggle('dark')}
                  defaultChecked={document.documentElement.classList.contains('dark')}
                />
                <div className="relative w-11 h-6 bg-muted rounded-full p-1 transition">
                  <div className="absolute inset-0 flex items-center justify-start px-1">
                    <div className="w-4 h-4 bg-white rounded-full transition-transform duration-200 transform 
                      dark:translate-x-5 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500 hidden dark:block">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-slate-600 dark:hidden">
                        <circle cx="12" cy="12" r="5"></circle>
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>
          
          {/* QA Engineer Name and Role */}
          <div className="mt-4 flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>{getInitials(qaName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{qaName}</span>
              <span className="text-xs text-muted-foreground">{userRole}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center px-4 border-b border-border shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="ml-auto flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Documentation
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback>{getInitials(qaName)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{qaName}</p>
                  <p className="text-xs text-muted-foreground">{userRole}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
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
      <Toaster />
    </div>
  );
};
