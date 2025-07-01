
import { supabase } from '@/lib/supabase';

// Simple activity types - only the 4 you need
export type ActivityType = 'user' | 'document' | 'video' | 'profile';

export interface ActivityData {
  type: ActivityType;
  title: string;
  userName: string;
}

/**
 * Main function to log any activity
 */
export const logActivity = async (activityData: ActivityData): Promise<boolean> => {
  try {
    const { error } = await (supabase as any)
      .from('activities')
      .insert([
        {
          type: activityData.type,
          title: activityData.title,
          user_name: activityData.userName,
        }
      ]);

    if (error) {
      console.error('Failed to log activity:', error);
      return false;
    }

    console.log('✅ Activity logged:', activityData.title);
    return true;
  } catch (error) {
    console.error('Error logging activity:', error);
    return false;
  }
};

/**
 * Simplified activity logging functions for the 4 specific types
 */

// 1. User Registration Activity
export const logUserRegistration = (userName: string) => 
  logActivity({
    type: 'user',
    title: 'New user registration',
    userName,
  });

// 2. Document Analysis Activity
export const logDocumentAnalysis = (userName: string, documentName?: string) => 
  logActivity({
    type: 'document',
    title: documentName 
      ? `Document analysis completed - ${documentName}` 
      : 'Document analysis completed',
    userName,
  });

// 3. Video Analysis Activity
export const logVideoAnalysis = (userName: string, videoName?: string) => 
  logActivity({
    type: 'video',
    title: videoName 
      ? `Video analysis uploaded - ${videoName}` 
      : 'Video analysis uploaded',
    userName,
  });

// 4. Profile Update Activity
export const logProfileUpdate = (userName: string) => 
  logActivity({
    type: 'profile',
    title: 'Profile updated',
    userName,
  });

/**
 * Quick helper functions with common patterns
 */
export const ActivityLogger = {
  // User activities
  userRegistered: (userName: string) => logUserRegistration(userName),
  
  // Document activities
  documentAnalyzed: (userName: string, documentName?: string) => 
    logDocumentAnalysis(userName, documentName),
  
  // Video activities
  videoAnalyzed: (userName: string, videoName?: string) => 
    logVideoAnalysis(userName, videoName),
  
  // Profile activities
  profileUpdated: (userName: string) => logProfileUpdate(userName),
};

/**
 * Format timestamp to relative time
 */
export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInMs = now.getTime() - activityTime.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } else {
    return activityTime.toLocaleDateString();
  }
};