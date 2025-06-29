import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, LayoutDashboard, Settings, BarChart, Upload } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { qaName, logout } = useAuth();
  
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
        </nav>

        {/* Sidebar Footer with Dark Mode Toggle */}
        <div className="absolute bottom-0 w-full p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Dark</span>
            <div className="flex items-center space-x-2">
              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="sr-only"
                  onChange={() => document.documentElement.classList.toggle('dark')}
                  defaultChecked={document.documentElement.classList.contains('dark')}
                />
                <div className="relative w-10 h-5 bg-muted rounded-full">
                  <div className="absolute inset-0 flex items-center justify-start px-0.5">
                    <div className="w-4 h-4 bg-white rounded-full transition-transform duration-200 
                      dark:translate-x-5"></div>
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
              <span className="text-xs text-muted-foreground">QA Engineer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center px-4 border-b border-border">
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
                  <p className="text-xs text-muted-foreground">QA Engineer</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
};
