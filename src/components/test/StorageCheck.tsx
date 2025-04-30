
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const StorageCheck = () => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<Record<string, any>>({});
  
  const checkStorageBucket = async () => {
    setIsChecking(true);
    setResults({});
    
    try {
      // Check if the profiles bucket exists
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('profiles');
        
      if (bucketError) {
        setResults(prev => ({ ...prev, bucket: { exists: false, error: bucketError } }));
      } else {
        setResults(prev => ({ ...prev, bucket: { exists: true, data: bucketData } }));
      }
      
      // List files in the bucket
      const { data: filesData, error: filesError } = await supabase
        .storage
        .from('profiles')
        .list('profile-images');
        
      if (filesError) {
        setResults(prev => ({ ...prev, files: { exists: false, error: filesError } }));
      } else {
        setResults(prev => ({ ...prev, files: { exists: true, count: filesData?.length, data: filesData } }));
      }
      
      // Check policies - Note: This RPC function might not exist, so we're wrapping it in a try/catch
      try {
        const { data: policiesData, error: policiesError } = await supabase
          .rpc('get_policies_for_bucket', { bucket_id: 'profiles' });
          
        if (policiesError) {
          setResults(prev => ({ ...prev, policies: { exists: false, error: policiesError } }));
        } else {
          setResults(prev => ({ ...prev, policies: { exists: true, data: policiesData } }));
        }
      } catch (error) {
        console.log('RPC function not available:', error);
        setResults(prev => ({ ...prev, policies: { exists: false, message: 'RPC function not available' } }));
      }
      
      toast({
        title: "Storage check completed",
        description: "Check the results below for details",
      });
      
    } catch (error) {
      console.error('Error checking storage:', error);
      toast({
        title: "Check failed",
        description: "An error occurred while checking storage setup",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Bucket Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={checkStorageBucket} 
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Check Storage Setup"
          )}
        </Button>
        
        {Object.keys(results).length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded border text-sm font-mono overflow-auto">
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StorageCheck;
