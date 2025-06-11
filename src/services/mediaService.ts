
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/storage";

export interface MediaItem {
  id: string;
  name: string;
  original_name: string;
  url: string;
  file_type: string;
  file_size: number;
  width?: number;
  height?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreateMediaItem {
  name: string;
  original_name: string;
  url: string;
  file_type: string;
  file_size: number;
  width?: number;
  height?: number;
}

// Get all media items for the current user
export const getUserMediaItems = async (): Promise<MediaItem[]> => {
  const { data, error } = await supabase
    .from('media_items')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching media items:', error);
    throw error;
  }
  
  return data || [];
};

// Create a new media item
export const createMediaItem = async (mediaData: CreateMediaItem): Promise<MediaItem> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('media_items')
    .insert({
      ...mediaData,
      user_id: user.id
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating media item:', error);
    throw error;
  }
  
  return data;
};

// Update a media item
export const updateMediaItem = async (id: string, updates: Partial<CreateMediaItem>): Promise<MediaItem> => {
  const { data, error } = await supabase
    .from('media_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating media item:', error);
    throw error;
  }
  
  return data;
};

// Delete a media item
export const deleteMediaItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('media_items')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting media item:', error);
    throw error;
  }
};

// Upload files and create media items
export const uploadMediaFiles = async (files: File[]): Promise<MediaItem[]> => {
  const results: MediaItem[] = [];
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  for (const file of files) {
    try {
      // Upload to Supabase Storage
      const result = await uploadImage(file, user.id);
      
      if (!result.success) {
        console.error(`Failed to upload ${file.name}:`, result.error);
        continue;
      }
      
      // Create media item in database
      const mediaItem = await createMediaItem({
        name: file.name,
        original_name: file.name,
        url: result.publicUrl!,
        file_type: file.type.startsWith('image/') ? 'image' : 'file',
        file_size: file.size,
        width: result.width,
        height: result.height
      });
      
      results.push(mediaItem);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
    }
  }
  
  return results;
};
