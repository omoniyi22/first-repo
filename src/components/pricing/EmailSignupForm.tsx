
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const EmailSignupForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('subscription_interests')
        .insert([{ email }]);
      
      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation - email already exists
          toast({
            title: "You're already on the list!",
            description: "This email has already been registered for updates.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Thanks for your interest!",
          description: "We'll notify you when new pricing plans are available.",
        });
      }
      
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
