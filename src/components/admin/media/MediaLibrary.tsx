
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid2X2, List, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import MediaGridView from './MediaGridView';
import MediaListView from './MediaListView';
import MediaUploadForm from './MediaUploadForm';

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  original_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  width?: number;
  height?: number;
  cloudinary_id?: string | null;
}

interface MediaLibraryProps {
  // Define any props here
}

const MediaLibrary: React.FC<MediaLibraryProps> = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load media items from database
  const loadMediaItems = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setMediaItems(data || []);
    } catch (error) {
      console.error('Error loading media items:', error);
      toast({
        title: "Error Loading Media",
        description: "Failed to load your media library.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMediaItems();
  }, [user]);

  const handleUploadComplete = async (files: File[]) => {
    try {
      // Refresh the media items list after upload
      await loadMediaItems();
      
      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${files.length} file(s) to your media library.`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload files to your media library.",
        variant: "destructive",
      });
    } finally {
      setIsUploadOpen(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      const { error } = await supabase
        .from('media_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMediaItems(prevItems => prevItems.filter(item => item.id !== id));
      toast({
        title: "Media Deleted",
        description: "The media item has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting media item:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the media item.",
        variant: "destructive",
      });
    }
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your media library...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">My Media Library</h2>
            <p className="text-sm text-gray-500">{mediaItems.length} items</p>
          </div>
          <Button onClick={() => setIsUploadOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        </div>

        <Tabs defaultValue={viewMode} className="space-y-4">
          <TabsList>
            <TabsTrigger value="grid" onClick={() => setViewMode('grid')}>
              <Grid2X2 className="mr-2 h-4 w-4" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="list" onClick={() => setViewMode('list')}>
              <List className="mr-2 h-4 w-4" />
              List
            </TabsTrigger>
          </TabsList>
          <TabsContent value="grid" className="outline-none">
            <MediaGridView items={mediaItems} onDelete={handleDeleteMedia} onSelect={() => {}} />
          </TabsContent>
          <TabsContent value="list" className="outline-none">
            <MediaListView items={mediaItems} onDelete={handleDeleteMedia} formatFileSize={formatFileSize} />
          </TabsContent>
        </Tabs>

        {isUploadOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-medium mb-4">Upload Media</h3>
              <MediaUploadForm 
                onComplete={handleUploadComplete} 
                onCancel={() => setIsUploadOpen(false)} 
                bucketId="user-media" 
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaLibrary;
