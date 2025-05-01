
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { language, translations } = useLanguage();
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Log the subscription attempt
      console.log('Newsletter subscription attempt for:', email);
      
      // Store the newsletter subscription data
      // NOTE: In a production environment, this would properly store to a Supabase table
      console.log('Newsletter subscription data:', {
        email,
        source: 'newsletter-form',
      });
      
      // Call the Supabase edge function to send confirmation email
      const { data, error } = await supabase.functions.invoke('send-newsletter-confirmation', {
        body: { email }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log('Newsletter subscription successful for:', email);
      console.log('Email sending response:', data);
      
      toast({
        title: t["subscription-successful"],
        description: t["thank-you-subscribing"],
      });
      
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: t["subscription-failed"],
        description: t["problem-subscribing"],
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
          <input 
            type="email" 
            placeholder={t["your-email"]} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-purple-900/50 border border-purple-800 rounded-l-md px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 w-full text-white"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded-r-md text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t["newsletter-subscribing"] : t["newsletter-subscribe"]}
        </button>
      </div>
    </form>
  );
};

export default NewsletterForm;
