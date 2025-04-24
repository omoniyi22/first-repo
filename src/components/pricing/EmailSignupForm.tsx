
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';

const EmailSignupForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // For now, just show a success message
    // TODO: Integrate with your email collection service
    toast({
      title: "Thanks for your interest!",
      description: "We'll notify you when subscriptions are available.",
    });
    
    setEmail('');
    setIsSubmitting(false);
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
          Notify Me
        </Button>
      </div>
    </form>
  );
};

export default EmailSignupForm;
