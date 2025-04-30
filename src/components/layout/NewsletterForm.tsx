
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail } from 'lucide-react';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error, data } = await supabase
        .from('subscription_interests')
        .insert([{ 
          email,
          source: 'newsletter'
        }])
        .select();
      
      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation - email already exists
          toast({
            title: "Already subscribed",
            description: "This email is already subscribed to our newsletter.",
          });
        } else {
          console.error('Newsletter submission error:', error);
          throw error;
        }
      } else {
        console.log('Newsletter subscription successful:', data);
        toast({
          title: "Subscription successful!",
          description: "Thank you for subscribing to our newsletter.",
        });
      }
      
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Subscription failed",
        description: "There was a problem subscribing to the newsletter. Please try again.",
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
            placeholder="Your email" 
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
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>
    </form>
  );
};

export default NewsletterForm;
