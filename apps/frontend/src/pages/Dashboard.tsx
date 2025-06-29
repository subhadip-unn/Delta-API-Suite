import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, FileText, Archive, Activity } from 'lucide-react';

const Dashboard = () => {
  const { qaName } = useAuth();
  const [todayRuns, setTodayRuns] = useState(0);
  const [lastReportTime, setLastReportTime] = useState<string | null>(null);
  const [recentConfigs, setRecentConfigs] = useState<string[]>([]);
  
  // Simulate loading data when component mounts
  useEffect(() => {
    // In a real app, these would come from localStorage or API
    // For demo purposes, we'll simulate some data
    setTodayRuns(Math.floor(Math.random() * 5)); // 0-4 runs today
    
    const hasRecentReport = Math.random() > 0.3; // 70% chance of having a report
    if (hasRecentReport) {
      const hours = Math.floor(Math.random() * 8); // 0-7 hours ago
      const mins = Math.floor(Math.random() * 60); // 0-59 minutes ago
      setLastReportTime(`${hours}h ${mins}m ago`);
    }
    
    // Simulate having some saved configs
    const configNames = [
      'Production API Comparison',
      'Dev Environment Test',
      'Mobile Endpoints Check',
      'Legacy API Validation'
    ];
    setRecentConfigs(configNames.slice(0, Math.floor(Math.random() * 3) + 1));
  }, []);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {qaName}</h1>
        <p className="text-muted-foreground mt-2">Here's an overview of your CBZ API Delta activity</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Activity Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="mr-2 h-4 w-4" />
              Today's Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayRuns}</div>
            <p className="text-xs text-muted-foreground">
              {todayRuns === 0 
                ? "No comparisons run today" 
                : `${todayRuns} comparison${todayRuns > 1 ? 's' : ''} run today`
              }
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/config">
              <Button variant="ghost" size="sm" className="text-xs">Run new comparison</Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Last Report Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Last Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastReportTime ? (
              <>
                <div className="text-2xl font-bold">{lastReportTime}</div>
                <p className="text-xs text-muted-foreground">Last comparison report generated</p>
              </>
            ) : (
              <>
                <div className="text-lg font-semibold flex items-center text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" /> No recent reports
                </div>
                <p className="text-xs text-muted-foreground mt-1">Run your first comparison</p>
              </>
            )}
          </CardContent>
          <CardFooter>
            {lastReportTime ? (
              <Link to="/reports">
                <Button variant="ghost" size="sm" className="text-xs">View last report</Button>
              </Link>
            ) : (
              <Link to="/config">
                <Button variant="ghost" size="sm" className="text-xs">Start comparison</Button>
              </Link>
            )}
          </CardFooter>
        </Card>
        
        {/* Saved Configurations Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Archive className="mr-2 h-4 w-4" />
              Saved Configurations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentConfigs.length > 0 ? (
              <div className="space-y-2">
                {recentConfigs.map((config, i) => (
                  <div key={i} className="text-sm pb-1 border-b border-border last:border-0">
                    {config}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center text-muted-foreground">
                <AlertTriangle className="mr-2 h-4 w-4" />
                <span className="text-sm">No saved configurations</span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/config">
              <Button variant="ghost" size="sm" className="text-xs">Manage configs</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Shortcuts Section */}
      <div className="pt-4">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/config">
            <Button>New Comparison</Button>
          </Link>
          <Link to="/reports">
            <Button variant="outline">View Reports</Button>
          </Link>
          <Link to="/upload">
            <Button variant="outline">Upload Report</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
