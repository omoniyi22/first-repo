export type ActivityType = 'user' | 'document' | 'video' | 'profile';

export interface DatabaseActivity {
  id: string;
  type: ActivityType;
  title: string;
  user_name: string;
  created_at: string;
  updated_at: string;
}

export interface TransformedActivity {
  id: string;
  type: ActivityType;
  title: string;
  user: string;
  time: string;
  icon: React.ReactNode;
}

export interface ActivityResponse {
  success: boolean;
  data?: DatabaseActivity[];
  error?: string;
  count?: number;
}