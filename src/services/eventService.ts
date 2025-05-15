
import { supabase } from '@/integrations/supabase/client';

export interface Event {
  id?: string;
  title: string;
  description?: string;
  eventDate: string;
  location?: string;
  eventType: string;
  discipline: 'Jumping' | 'Dressage' | 'Both';
  imageUrl?: string;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

export const fetchEvents = async (userId?: string): Promise<Event[]> => {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    
    // If userId is provided, filter events by user
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(transformDatabaseEventToEvent);
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const fetchEventById = async (id: string): Promise<Event | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return transformDatabaseEventToEvent(data);
  } catch (error) {
    console.error(`Error fetching event with id "${id}":`, error);
    return null;
  }
};

export const createEvent = async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user && !event.userId) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('events')
      .insert([{
        title: event.title,
        description: event.description || null,
        event_date: event.eventDate,
        location: event.location || null,
        event_type: event.eventType,
        discipline: event.discipline,
        image_url: event.imageUrl || null,
        is_featured: event.isFeatured || false,
        user_id: event.userId || user?.id
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return transformDatabaseEventToEvent(data);
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const updateEvent = async (id: string, event: Partial<Event>) => {
  try {
    // Convert Event format to database schema
    const dbEvent: Record<string, any> = {
      title: event.title,
      description: event.description,
      event_date: event.eventDate,
      location: event.location,
      event_type: event.eventType,
      discipline: event.discipline,
      image_url: event.imageUrl,
      is_featured: event.isFeatured
    };
    
    // Filter out undefined values
    Object.keys(dbEvent).forEach(key => {
      if (dbEvent[key] === undefined) delete dbEvent[key];
    });
    
    const { data, error } = await supabase
      .from('events')
      .update(dbEvent)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return transformDatabaseEventToEvent(data);
  } catch (error) {
    console.error(`Error updating event with id "${id}":`, error);
    throw error;
  }
};

export const deleteEvent = async (id: string) => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting event with id "${id}":`, error);
    throw error;
  }
};

// Utility functions
const transformDatabaseEventToEvent = (dbEvent: any): Event => {
  if (!dbEvent) return null as any;
  
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description,
    eventDate: dbEvent.event_date,
    location: dbEvent.location,
    eventType: dbEvent.event_type,
    discipline: dbEvent.discipline,
    imageUrl: dbEvent.image_url,
    isFeatured: dbEvent.is_featured,
    createdAt: dbEvent.created_at,
    updatedAt: dbEvent.updated_at,
    userId: dbEvent.user_id
  };
};
