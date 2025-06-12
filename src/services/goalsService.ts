
import { supabase } from "@/integrations/supabase/client";

export interface Goal {
  id: string;
  user_id: string;
  goal_text: string;
  goal_type: 'short-term' | 'medium-term' | 'long-term';
  progress: number;
  target_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalData {
  goal_text: string;
  goal_type: 'short-term' | 'medium-term' | 'long-term';
  progress: number;
  target_date: string;
}

export interface UpdateGoalData {
  goal_text?: string;
  progress?: number;
  target_date?: string;
}

export const goalsService = {
  // Fetch all goals for the current user
  async getUserGoals(): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }

    return data || [];
  },

  // Create a new goal
  async createGoal(goalData: CreateGoalData): Promise<Goal> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('goals')
      .insert({
        ...goalData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      throw error;
    }

    return data;
  },

  // Update an existing goal
  async updateGoal(goalId: string, updateData: UpdateGoalData): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', goalId)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      throw error;
    }

    return data;
  },

  // Delete a goal
  async deleteGoal(goalId: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }
};
