
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const DashboardHeader = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [displayName, setDisplayName] = useState('');
  
  useEffect(() => {
    const fetchDisplayName = async () => {
      if (!user) return;
      
      try {
        // Fetch display name from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        }
        
        // Use profile display name if available, otherwise fall back to user metadata or email
        const name = profile?.display_name || 
                     user?.user_metadata?.full_name || 
                     user?.email?.split('@')[0] || 
                     'Rider';
        
        setDisplayName(name);
      } catch (error) {
        console.error('Error fetching display name:', error);
        // Fallback to user metadata
        const fallbackName = user?.user_metadata?.full_name || 
                             user?.email?.split('@')[0] || 
                             'Rider';
        setDisplayName(fallbackName);
      }
    };
    
    fetchDisplayName();
  }, [user]);

  return (
    <div className="flex flex-col w-full">
      <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-purple-900">
        {language === 'en' ? 'Welcome, ' : 'Bienvenido, '}{displayName}
      </h1>
      <p className="mt-1 sm:mt-2 text-sm sm:text-base text-purple-700">
        {language === 'en' 
          ? 'Track your progress and upload new dressage tests' 
          : 'Sigue tu progreso y sube nuevas pruebas de doma'}
      </p>
    </div>
  );
};

export default DashboardHeader;
