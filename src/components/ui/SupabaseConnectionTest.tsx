
import { useState, useEffect } from 'react';
import { testSupabaseConnection, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const checkConnection = async () => {
    setIsLoading(true);
    
    try {
      if (!isSupabaseConfigured()) {
        setConnectionStatus({
          isConnected: false,
          message: 'Supabase is not properly configured. Please check your environment variables.',
        });
        return;
      }
      
      const result = await testSupabaseConnection();
      setConnectionStatus(result);
      
      toast({
        title: result.isConnected ? "Connection Successful" : "Connection Failed",
        description: result.message,
        variant: result.isConnected ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus({
        isConnected: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Automatically check connection when component mounts
    checkConnection();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Supabase Connection Status</h2>
      
      {connectionStatus && (
        <Alert variant={connectionStatus.isConnected ? "default" : "destructive"} className="mb-4">
          <AlertTitle>{connectionStatus.isConnected ? "Connected" : "Not Connected"}</AlertTitle>
          <AlertDescription>{connectionStatus.message}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={checkConnection} 
        disabled={isLoading}
        className="bg-purple-600 hover:bg-purple-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Testing Connection...
          </>
        ) : (
          "Test Connection Again"
        )}
      </Button>
    </div>
  );
};

export default SupabaseConnectionTest;
