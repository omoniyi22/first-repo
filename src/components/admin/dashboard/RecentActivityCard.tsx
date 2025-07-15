// components/RecentActivityCard.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, User, Video, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { ActivityType, DatabaseActivity, TransformedActivity } from '@/types/activity';
import { formatTimeAgo } from '@/utils/activityTracker';

interface RecentActivityCardProps {
  limit?: number;
  enableRealtime?: boolean;
  showRefreshButton?: boolean;
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ 
  limit = 10,
  enableRealtime = true,
  showRefreshButton = false
}) => {
  const [activities, setActivities] = useState<TransformedActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Function to get the appropriate icon based on activity type
  const getIcon = (type: ActivityType): React.ReactNode => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Function to get background color based on activity type
  const getBackgroundColor = (type: ActivityType): string => {
    switch (type) {
      case 'user':
        return 'bg-purple-100 text-purple-600';
      case 'document':
        return 'bg-blue-100 text-blue-600';
      case 'video':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Fetch activities from Supabase
  const fetchActivities = async (isRefresh: boolean = false): Promise<void> => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Using any to bypass type checking until types are updated
      const { data, error } = await (supabase as any)
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      // Transform data to match the original structure
      const transformedActivities: TransformedActivity[] = (data || []).map((activity: DatabaseActivity) => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        user: activity.user_name,
        time: formatTimeAgo(activity.created_at),
        icon: getIcon(activity.type)
      }));

      setActivities(transformedActivities);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recent activities');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Manual refresh function
  const handleRefresh = (): void => {
    fetchActivities(true);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchActivities();
  }, [limit]);

  // Set up real-time subscription
  useEffect(() => {
    if (!enableRealtime) return;

    const subscription = (supabase as any)
      .channel('activities_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'activities'
        },
        (payload: any) => {
          console.log('Real-time update received:', payload);
          // Refresh activities when changes occur
          fetchActivities();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [enableRealtime, limit]);

  // Loading skeleton component
  const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="flex items-start space-x-3 animate-pulse">
          <div className="rounded-full p-1.5 flex-shrink-0 bg-gray-200 w-8 h-8"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error state
  if (error && !loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
            {showRefreshButton && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Refresh activities"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-red-500">
            <AlertCircle className="h-8 w-8 mb-2" />
            <span className="text-sm text-center mb-4">{error}</span>
            <button 
              onClick={() => fetchActivities()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
              disabled={loading}
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
          {showRefreshButton && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh activities"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSkeleton />
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activities found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`
                  rounded-full p-1.5 flex-shrink-0 transition-colors
                  ${getBackgroundColor(activity.type)}
                `}>
                  {activity.icon}
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.user}</p>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;