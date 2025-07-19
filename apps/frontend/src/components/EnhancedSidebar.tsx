import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  Settings, 
  BarChart, 
  Upload, 
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Zap
} from 'lucide-react';

interface EnhancedSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
  className?: string;
}

export const EnhancedSidebar = ({ isOpen, onToggle, onCollapseChange, className }: EnhancedSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then fallback to system preference
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    // Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const { qaName, userRole } = useAuth();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Get the initials from the QA name for the avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Initialize dark mode on component mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle dark mode with persistence
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Update DOM
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Persist to localStorage
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  // Handle collapse toggle
  const handleCollapseToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  // Smart sidebar auto-hide on scroll (fixed to work with proper positioning)
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      
      if (Math.abs(scrollY - lastScrollY) < 10) {
        ticking = false;
        return;
      }

      // Auto-collapse on scroll down, expand on scroll up (only on desktop)
      if (window.innerWidth >= 1024) {
        if (scrollY > lastScrollY && scrollY > 150) {
          // Scrolling down - auto-collapse if not hovered
          if (!isCollapsed && !isHovered) {
            setIsCollapsed(true);
            onCollapseChange?.(true);
          }
        } else if (scrollY < lastScrollY - 50) {
          // Scrolling up - auto-expand if collapsed
          if (isCollapsed && !isHovered) {
            setIsCollapsed(false);
            onCollapseChange?.(false);
          }
        }
      }

      lastScrollY = scrollY;
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
    return () => window.removeEventListener('scroll', requestTick);
  }, [isCollapsed, isHovered, onCollapseChange]);

  // Navigation items
  const navigationItems = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Overview & Analytics'
    },
    {
      to: '/config',
      icon: Settings,
      label: 'Config',
      description: 'API Configuration'
    },
    {
      to: '/reports',
      icon: BarChart,
      label: 'Reports',
      description: 'Test Results'
    },
    {
      to: '/upload',
      icon: Upload,
      label: 'Upload Report',
      description: 'Import Test Data'
    },
    {
      to: '/json-diff',
      icon: Zap,
      label: 'DeltaPro+',
      description: 'JSON Diff Tool'
    }
  ];

  const effectiveWidth = isCollapsed && !isHovered ? 'w-16' : 'w-64';
  const showLabels = !isCollapsed || isHovered;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card/95 backdrop-blur-sm border-r border-border/50 transform transition-all duration-300 ease-in-out",
          // Mobile behavior
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop behavior - always visible and fixed, never scrolls
          "lg:translate-x-0",
          effectiveWidth,
          "group hover:shadow-lg",
          className
        )}
        onMouseEnter={() => {
          // Clear any existing timeout
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
          }
          // Set hover state with slight delay for better UX
          const timeout = setTimeout(() => setIsHovered(true), 100);
          setHoverTimeout(timeout);
        }}
        onMouseLeave={() => {
          // Clear timeout and reset hover state
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
          }
          setIsHovered(false);
        }}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
          <div className={cn(
            "flex items-center transition-all duration-300 ease-in-out",
            showLabels ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
          )}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">Δ</span>
              </div>
              {showLabels && (
                <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CBZ Delta
                </span>
              )}
            </div>
          </div>
          
          {/* Collapse Toggle - Desktop Only with Tooltip */}
          <div className="relative hidden lg:block">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 transition-all duration-200 hover:bg-accent/50 group/toggle",
                showLabels ? "opacity-100" : "opacity-70 hover:opacity-100"
              )}
              onClick={handleCollapseToggle}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
            
            {/* Professional Tooltip */}
            <div className={cn(
              "absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border opacity-0 group-hover/toggle:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50",
              "before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-popover"
            )}>
              {isCollapsed ? 'Open sidebar' : 'Close sidebar'}
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group/nav flex items-center rounded-lg text-sm font-medium transition-all duration-200 relative",
                    "hover:bg-accent/50 hover:shadow-sm",
                    showLabels ? "px-3 py-2.5" : "px-2 py-2.5 justify-center",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                  )}
                  onClick={() => {
                    // If sidebar is collapsed and not hovered, allow direct navigation
                    if (isCollapsed && !isHovered) {
                      // Let the navigation happen naturally
                      // Close mobile sidebar on navigation
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                      return;
                    }
                    
                    // Normal behavior for expanded sidebar
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
                  )}
                  
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-200",
                    showLabels ? "mr-3" : "mr-0",
                    isActive 
                      ? "text-primary-foreground" 
                      : "text-muted-foreground group-hover/nav:text-foreground"
                  )} />
                  
                  {showLabels && (
                    <div className="flex flex-col">
                      <span className="leading-none">{item.label}</span>
                      <span className={cn(
                        "text-xs transition-colors duration-200",
                        isActive ? "text-primary-foreground/70" : "text-muted-foreground/70"
                      )}>
                        {item.description}
                      </span>
                    </div>
                  )}

                  {/* Professional Tooltip for collapsed state */}
                  {!showLabels && (
                    <div className={cn(
                      "absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg border opacity-0 group-hover/nav:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50",
                      "before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-popover"
                    )}>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-3 border-t border-border/50 space-y-3 overflow-hidden">
            {/* Dark Mode Toggle */}
            <div className={cn(
              "flex items-center transition-all duration-200 relative group/theme",
              showLabels ? "justify-between" : "justify-center"
            )}>
              {showLabels && (
                <div className="flex items-center space-x-2">
                  {isDarkMode ? (
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Sun className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="h-8 w-8 hover:bg-accent/50 transition-colors duration-200"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              {/* Tooltip for collapsed state */}
              {!showLabels && (
                <div className={cn(
                  "absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border opacity-0 group-hover/theme:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50",
                  "before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-popover"
                )}>
                  {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </div>
              )}
            </div>

            {/* QA Profile */}
            <div className={cn(
              "flex items-center transition-all duration-200 p-2 rounded-lg bg-accent/30",
              showLabels ? "space-x-3" : "justify-center"
            )}>
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                  {getInitials(qaName)}
                </AvatarFallback>
              </Avatar>
              
              {showLabels && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium truncate">{qaName}</span>
                  <span className="text-xs text-muted-foreground truncate">{userRole}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
