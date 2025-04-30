
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Check, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const StorageCheck = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{success: boolean; message: string; url?: string} | null>(null);
  const [bucketName, setBucketName] = useState('profile-images');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleBucketChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBucketName(e.target.value);
  };
  
  const uploadFile = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file first.",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);
    setResult(null);
    
    try {
      // Get environment variables from meta tags
      const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.getAttribute('content');
      const supabaseAnonKey = document.querySelector('meta[name="supabase-anon-key"]')?.getAttribute('content');
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase configuration not found");
      }
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Generate a unique file name
      const fileName = `${Date.now()}_${file.name}`;
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        throw error;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);
      
      setResult({
        success: true,
        message: "File uploaded successfully!",
        url: urlData.publicUrl
      });
      
    } catch (error) {
      console.error('Storage test error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Storage Upload Test</CardTitle>
        <CardDescription>Test Supabase storage functionality</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bucket">Bucket Name</Label>
          <Input 
            id="bucket" 
            value={bucketName} 
            onChange={handleBucketChange} 
            placeholder="Enter bucket name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="file">Test File</Label>
          <Input 
            id="file" 
            type="file" 
            onChange={handleFileChange}
          />
        </div>
        
        {result && (
          <div className={`p-3 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <div className="flex items-center">
              {result.success ? (
                <Check className="h-5 w-5 mr-2 text-green-500" />
              ) : (
                <X className="h-5 w-5 mr-2 text-red-500" />
              )}
              <p>{result.message}</p>
            </div>
            {result.url && (
              <div className="mt-2">
                <p className="text-sm font-medium">File URL:</p>
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm break-all text-blue-600 hover:underline"
                >
                  {result.url}
                </a>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={uploadFile} 
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Test File
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StorageCheck;
