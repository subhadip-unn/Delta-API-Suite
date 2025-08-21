import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  FileText,
  GitCompare,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  UserCog,
  HelpCircle,
  Database,
  BarChart3
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DocumentationModal } from '@/components/modals/DocumentationModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { ActivityLogModal } from '@/components/modals/ActivityLogModal';

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
  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then fallback to system preference
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    // Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Modal states
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const { qaName, userRole, logout } = useAuth();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

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
    setIsManuallyCollapsed(newCollapsed); // Track manual state
    onCollapseChange?.(newCollapsed);
  };

  // Improved auto-hide: only auto-collapse, never auto-expand unless user explicitly opens
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      
      if (Math.abs(scrollY - lastScrollY) < 15) {
        ticking = false;
        return;
      }

      // Only auto-collapse on scroll down, never auto-expand
      if (window.innerWidth >= 1024 && !isManuallyCollapsed) {
        if (scrollY > lastScrollY && scrollY > 200) {
          // Scrolling down - auto-collapse if not hovered and not manually controlled
          if (!isCollapsed && !isHovered) {
            setIsCollapsed(true);
            onCollapseChange?.(true);
          }
        }
        // Removed auto-expand on scroll up - user must manually open
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
  }, [isCollapsed, isHovered, isManuallyCollapsed, onCollapseChange]);

  // Navigation items - Delta Suite
  const navigationItems = [
    { 
      icon: BarChart3, 
      label: 'DeltaMetrics', 
      to: '/', 
      description: 'Dashboard & tool hub' 
    },
    { 
      icon: () => (
        <div className="relative">
          <GitCompare className="h-5 w-5" />
          <Zap className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 animate-pulse" />
        </div>
      ), 
      label: 'DeltaPro+', 
      to: '/deltapro', 
      description: 'Advanced JSON comparison tool' 
    },
    { icon: Database, label: 'DeltaDB', to: '/dashboard', description: 'API management & organization' },
    { icon: HelpCircle, label: 'Documentation', to: '/docs', description: 'Help and guides' },
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

      {/* Professional Modals */}
      <DocumentationModal 
        open={showDocumentation} 
        onOpenChange={setShowDocumentation} 
      />
      <SettingsModal 
        open={showSettings} 
        onOpenChange={setShowSettings} 
      />
      <ActivityLogModal 
        open={showActivityLog} 
        onOpenChange={setShowActivityLog} 
      />

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
          // Only expand on hover if not manually collapsed
          if (!isManuallyCollapsed) {
            // Clear any existing timeout
            if (hoverTimeout) {
              clearTimeout(hoverTimeout);
              setHoverTimeout(null);
            }
            // Set hover state with delay for better UX
            const timeout = setTimeout(() => setIsHovered(true), 150);
            setHoverTimeout(timeout);
          }
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
                  CBZ API Delta
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
                item.to === '/docs' ? (
                  <Button
                    key={item.to}
                    variant="ghost"
                    className={cn(
                      "group/nav flex items-center rounded-lg text-sm font-medium transition-all duration-200 relative w-full",
                      "hover:bg-accent/50 hover:shadow-sm",
                      showLabels ? "px-3 py-2.5 justify-start" : "px-2 py-2.5 justify-center",
                      "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                    )}
                    onClick={() => {
                      setShowDocumentation(true);
                      // If sidebar is collapsed and not hovered, allow direct action
                      if (isCollapsed && !isHovered) {
                        // Modal will open
                      }
                    }}
                  >
                    <div className="flex items-center w-full">
                      <div className="flex items-center justify-center w-5 h-5 mr-3 shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      {showLabels && (
                        <div className="flex-1 text-left">
                          <div className="font-medium">{item.label}</div>
                        </div>
                      )}
                    </div>

                    {/* Animated Tooltip for collapsed state */}
                    {!showLabels && (
                      <div className={cn(
                        "absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg border transition-all duration-300 pointer-events-none whitespace-nowrap z-50",
                        "opacity-0 scale-95 translate-x-2 group-hover/nav:opacity-100 group-hover/nav:scale-100 group-hover/nav:translate-x-0",
                        "before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-popover"
                      )}>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                      </div>
                    )}
                  </Button>
                ) : (
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

                    {/* Animated Tooltip for collapsed state */}
                    {!showLabels && (
                      <div className={cn(
                        "absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg border transition-all duration-300 pointer-events-none whitespace-nowrap z-50",
                        "opacity-0 scale-95 translate-x-2 group-hover/nav:opacity-100 group-hover/nav:scale-100 group-hover/nav:translate-x-0",
                        "before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-popover"
                      )}>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                      </div>
                    )}
                  </NavLink>
                )
              );
            })}
          </nav>

          {/* Profile and Dark Mode Section - Always at bottom */}
          <div className="mt-auto border-t border-border/50 p-4 space-y-3">
            {/* QA Profile with Dropdown */}
            <div className={cn(
              "flex items-center transition-all duration-300",
              showLabels ? "space-x-3" : "justify-center"
            )}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "h-auto p-2 hover:bg-accent/50 transition-colors duration-200",
                      showLabels ? "w-full justify-start" : "w-8 h-8"
                    )}
                    onMouseEnter={() => {
                      // Prevent sidebar auto-collapse when profile is hovered
                      setIsHovered(true);
                    }}
                  >
                    <div className={cn(
                      "flex items-center",
                      showLabels ? "space-x-3 w-full" : "justify-center"
                    )}>
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                          {qaName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {showLabels && (
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-medium text-foreground truncate">{qaName}</p>
                          <p className="text-xs text-muted-foreground truncate">{userRole}</p>
                        </div>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align={showLabels ? "end" : "start"} 
                  side={showLabels ? "top" : "right"}
                  className="w-56 mb-2"
                  sideOffset={8}
                  alignOffset={0}
                >
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{qaName}</p>
                    <p className="text-xs text-muted-foreground">{userRole}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => setShowSettings(true)}
                  >
                    <UserCog className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => setShowActivityLog(true)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Activity Log
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={toggleDarkMode}
                    className="cursor-pointer"
                  >
                    {isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
