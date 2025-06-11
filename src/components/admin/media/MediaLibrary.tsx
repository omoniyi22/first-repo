
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid2X2, List, Plus } from 'lucide-react';
import MediaGridView from './MediaGridView';
import MediaListView from './MediaListView';
import MediaUploadForm from './MediaUploadForm';

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  dimensions?: {
    width?: number;
    height?: number;
  };
  duration?: number; // Add duration for video files
}

interface MediaLibraryProps {
  // Define any props here
}

const MediaLibrary: React.FC<MediaLibraryProps> = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]); // Replace with actual data fetching

  const handleUploadComplete = (newItems: MediaItem[]) => {
    // Update media items state after successful upload
    setMediaItems(prevItems => [...prevItems, ...newItems]);
    setIsUploadOpen(false);
  };

  const handleDeleteMedia = (id: string) => {
    // Delete media item logic here
    setMediaItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Media Library</h2>
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Upload Media</h3>
              <MediaUploadForm onComplete={handleUploadComplete} onCancel={() => setIsUploadOpen(false)} bucketId="blog-images" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaLibrary;
