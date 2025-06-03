import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ActivityIcon,
  Users,
  FileText,
  Video,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatsCard from "@/components/admin/dashboard/StatsCard";
import RecentActivityCard from "@/components/admin/dashboard/RecentActivityCard";
import UsageChart from "@/components/admin/dashboard/UsageChart";

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVideosAnalyzed: 0,
    totalDocumentsAnalyzed: 0,
    currentMonthVideosPercentageFormatted: "0%",
    activeSubscriptions: 0,
    currentMonthUsersPercentageFormatted: "0%",
    currentMonthDocumentsAnalyzed: "0%",
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user count
        // const { data: allUser, error: userError } = await supabase
        //   .from("profiles")
        //   .select("*");
        const allUser = await fetchUsers();

        const usersData = getCurrentMonthUsersWithPercentage(allUser);

        // Fetch document analysis count
        const { data: allDocs, error: docsError } = await supabase
          .from("document_analysis")
          .select("*");

        const videoCount = allDocs.filter((doc) =>
          doc.file_type.startsWith("video")
        );

        const videoData = getCurrentMonthUsersWithPercentage(videoCount);

        const docsCount = allDocs.filter((doc) =>
          doc.file_type.startsWith("application")
        );
        const docsData = getCurrentMonthUsersWithPercentage(docsCount);

        setStats({
          totalUsers: usersData.totalEntries || 0,
          currentMonthUsersPercentageFormatted:
            usersData.percentageFormatted || "0%",
          totalDocumentsAnalyzed: docsData.totalEntries || 0,
          currentMonthDocumentsAnalyzed: docsData.percentageFormatted || "0%",
          totalVideosAnalyzed: videoData.totalEntries || 0,
          currentMonthVideosPercentageFormatted:
            videoData.percentageFormatted || "0%",
          activeSubscriptions: 0,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log("Fetching users via Edge Function...");

      // Call the Edge Function to get users
      const { data, error } = await supabase.functions.invoke(
        "get-admin-users"
      );

      if (error) {
        console.error("Error calling Edge Function:", error);
        throw error;
      }

      if (!data || !data.users || data.users.length === 0) {
        console.warn("No users found via Edge Function");
      }

      // Process the user data
      const fetchedUsers = data.users.filter((user) => user.role != "admin");

      return fetchedUsers;
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const getCurrentMonthUsersWithPercentage = (allUsers) => {
    // Filter current month users
    const currentMonthEntries = allUsers.filter((user) => {
      const now = new Date();
      const userCreatedAt = new Date(user.created_at);
      return (
        userCreatedAt.getFullYear() === now.getFullYear() &&
        userCreatedAt.getMonth() === now.getMonth()
      );
    });

    // Calculate percentage
    const totalEntries = allUsers.length;
    const currentMonthCount = currentMonthEntries.length;
    const percentage =
      totalEntries > 0 ? (currentMonthCount / totalEntries) * 100 : 0;

    return {
      currentMonthEntries,
      currentMonthCount,
      totalEntries,
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      percentageFormatted: `${Math.round(percentage * 100) / 100}%`,
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-1">
          Welcome to the AI Equestrian Admin Panel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="h-5 w-5 text-purple-600" />}
          trend={stats.currentMonthUsersPercentageFormatted}
          isLoading={isLoading}
        />
        <StatsCard
          title="Documents Analyzed"
          value={stats.totalDocumentsAnalyzed}
          icon={<FileText className="h-5 w-5 text-blue-600" />}
          trend={stats.currentMonthDocumentsAnalyzed}
          isLoading={isLoading}
        />
        <StatsCard
          title="Videos Analyzed"
          value={stats.totalVideosAnalyzed}
          icon={<Video className="h-5 w-5 text-green-600" />}
          trend={stats.currentMonthVideosPercentageFormatted}
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={<TrendingUp className="h-5 w-5 text-amber-600" />}
          trend="0%"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Usage Analytics
            </CardTitle>
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
                  <p className="text-xs text-gray-500">
                    Scheduled for May 10, 2025
                  </p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Jumping
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">Competition Preparation Guide</p>
                  <p className="text-xs text-gray-500">
                    Scheduled for May 15, 2025
                  </p>
                </div>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  Dressage
                </span>
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
