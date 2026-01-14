
import { useState, useEffect } from 'react';
import { testSupabaseConnection, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ExternalLink } from 'lucide-react';

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
          message: 'Supabase is not properly configured. You need to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Lovable project settings.',
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
    <div className="p-6 max-w-md mx-auto border border-gray-200 rounded-xl shadow-sm bg-white mt-4">
      <h2 className="text-xl font-semibold mb-4">Supabase Connection Status</h2>
      
      {connectionStatus && (
        <Alert variant={connectionStatus.isConnected ? "default" : "destructive"} className="mb-4">
          <AlertTitle>{connectionStatus.isConnected ? "Connected" : "Not Connected"}</AlertTitle>
          <AlertDescription className="mt-2">{connectionStatus.message}</AlertDescription>
          
          {!connectionStatus.isConnected && (
            <div className="mt-3 text-sm">
              <p>To configure Supabase:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Go to Project Settings in Lovable</li>
                <li>Add your Supabase URL and anon key as environment variables:</li>
                <ul className="list-disc pl-5 mt-1">
                  <li><code>VITE_SUPABASE_URL</code></li>
                  <li><code>VITE_SUPABASE_ANON_KEY</code></li>
                </ul>
                <li>You can find these values in your Supabase project settings</li>
              </ol>
            </div>
          )}
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
