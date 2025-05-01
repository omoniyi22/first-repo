
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const EmailSignupForm = () => {
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
      console.log('Pricing interest for:', email);
      
      // Call the Supabase edge function to send confirmation email
      const { data, error } = await supabase.functions.invoke('send-newsletter-confirmation', {
        body: { email }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log('Pricing page subscription successful for:', email);
      console.log('Email sending response:', data);
      
      toast({
        title: language === 'en' ? "Thanks for your interest!" : "¡Gracias por tu interés!",
        description: language === 'en' ? "We'll notify you when new pricing plans are available." : "Te notificaremos cuando los nuevos planes de precios estén disponibles.",
      });
      
      setEmail('');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: language === 'en' ? "Oops!" : "¡Ups!",
        description: language === 'en' ? "There was a problem processing your request. Please try again." : "Hubo un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t["email-placeholder"]}
            required
            className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? t["sending"] : t["notify-me"]}
        </Button>
      </div>
    </form>
  );
};

export default EmailSignupForm;
