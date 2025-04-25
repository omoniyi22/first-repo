
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const EmailSignupForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured() || !supabase) {
        // If not in production or Supabase isn't configured, show a preview message
        toast({
          title: "Development Mode",
          description: "This would send an email in production. Supabase connection not configured yet.",
        });
        setEmail('');
        return;
      }
      
      // First save to Supabase
      const { error: dbError } = await supabase
        .from('subscription_interests')
        .insert([{ email }]);
      
      if (dbError) throw dbError;

      // Then trigger welcome email
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send welcome email');
      }

      toast({
        title: "Thanks for your interest!",
        description: "We'll send your details to Jenny at Appetite Creative.",
      });
      
      setEmail('');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Oops!",
        description: "There was a problem processing your request. Please try again.",
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
            placeholder="Enter your email"
            required
            className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? 'Sending...' : 'Notify Me'}
        </Button>
      </div>
    </form>
  );
};

export default EmailSignupForm;
