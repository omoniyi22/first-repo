
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ActivityIcon,
  Users,
  FileText,
  Video,
  TrendingUp,
  Calendar
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatsCard from "@/components/admin/dashboard/StatsCard";
import RecentActivityCard from "@/components/admin/dashboard/RecentActivityCard";
import UsageChart from "@/components/admin/dashboard/UsageChart";

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    documentsAnalyzed: 0,
    videosAnalyzed: 0,
    activeSubscriptions: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user count
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch document analysis count
        const { count: docCount, error: docError } = await supabase
          .from('document_analysis')
          .select('*', { count: 'exact', head: true });
          
        // In a real app, you would fetch video analysis and subscription counts similarly
        // For now we'll use dummy data

        setStats({
          totalUsers: userCount || 0,
          documentsAnalyzed: docCount || 0,
          videosAnalyzed: 12, // Dummy data
          activeSubscriptions: 8 // Dummy data
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome to the AI Equestrian Admin Panel</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={<Users className="h-5 w-5 text-purple-600" />}
          trend="+12%" 
          isLoading={isLoading} 
        />
        <StatsCard 
          title="Documents Analyzed" 
          value={stats.documentsAnalyzed} 
          icon={<FileText className="h-5 w-5 text-blue-600" />}
          trend="+5%" 
          isLoading={isLoading} 
        />
        <StatsCard 
          title="Videos Analyzed" 
          value={stats.videosAnalyzed} 
          icon={<Video className="h-5 w-5 text-green-600" />}
          trend="+18%" 
          isLoading={isLoading} 
        />
        <StatsCard 
          title="Active Subscriptions" 
          value={stats.activeSubscriptions} 
          icon={<TrendingUp className="h-5 w-5 text-amber-600" />}
          trend="+3%" 
          isLoading={isLoading} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Usage Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <UsageChart />
          </CardContent>
        </Card>

        <RecentActivityCard />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Upcoming Posts
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">New AI Training Techniques</p>
                  <p className="text-xs text-gray-500">Scheduled for May 10, 2025</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Jumping</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">Competition Preparation Guide</p>
                  <p className="text-xs text-gray-500">Scheduled for May 15, 2025</p>
                </div>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Dressage</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              <div className="flex items-center">
                <ActivityIcon className="mr-2 h-5 w-5" />
                System Status
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>API System</span>
                <span className="flex items-center text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-600 mr-1"></span>
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Database</span>
                <span className="flex items-center text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-600 mr-1"></span>
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Storage</span>
                <span className="flex items-center text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-600 mr-1"></span>
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>ML Inference</span>
                <span className="flex items-center text-yellow-600">
                  <span className="h-2 w-2 rounded-full bg-yellow-600 mr-1"></span>
                  Degraded
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
