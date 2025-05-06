
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, Upload, Loader2 } from "lucide-react";
import { MediaItem } from "./MediaLibrary";
import MediaGridView from "./MediaGridView";
import MediaUploadForm from "./MediaUploadForm";
import { useToast } from "@/hooks/use-toast";
import MediaBucket from "./MediaBucket";

interface MediaSelectorProps {
  value: string;
  onChange: (url: string) => void;
  onImageSelect?: (mediaItem: MediaItem) => void;
}

const BLOG_MEDIA_BUCKET = "blog-images";

const MediaSelector = ({ value, onChange, onImageSelect }: MediaSelectorProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploadView, setIsUploadView] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isBucketReady, setIsBucketReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();
  
  // Handle bucket initialization
  const handleBucketInitialized = (success: boolean) => {
    console.log("Bucket initialization complete, success:", success);
    setIsBucketReady(success);
    setIsInitializing(false);
    
    if (!success) {
      toast({
        title: "Storage Error",
        description: "Could not initialize media storage. Some features may not work correctly.",
        variant: "destructive"
      });
    }
  };
  
  // Simulated media items for the demo
  const generateSampleMediaItems = () => {
    const sampleImages: MediaItem[] = [
      { 
        id: "img1", 
        name: "Sample Image 1.jpg", 
        url: "https://images.unsplash.com/photo-1518770660439-4636190af475",
        type: "image", 
        size: 1024000,
        uploadedAt: new Date().toISOString()
      },
      { 
        id: "img2", 
        name: "Sample Image 2.jpg", 
        url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
        type: "image", 
        size: 2048000,
        uploadedAt: new Date().toISOString()
      },
      { 
        id: "img3", 
        name: "Sample Image 3.jpg", 
        url: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
        type: "image", 
        size: 1536000,
        uploadedAt: new Date().toISOString()
      }
    ];
    return sampleImages;
  };

  // Load media items when component mounts
  useEffect(() => {
    if (!isBucketReady && !isInitializing) {
      console.log("Bucket is not ready, not loading media items");
      return;
    }
    
    if (isInitializing) {
      console.log("Still initializing, waiting before loading media items");
      return;
    }
    
    console.log("Loading media items");
    try {
      // Get the media item metadata without the full data URLs
      const mediaItemsIndex = localStorage.getItem('mediaItemsIndex');
      let userUploadedItems: MediaItem[] = [];
      
      if (mediaItemsIndex) {
        try {
          userUploadedItems = JSON.parse(mediaItemsIndex);
          console.log("Loaded user uploaded items metadata:", userUploadedItems.length);
        } catch (e) {
          console.error("Error parsing media items index:", e);
          userUploadedItems = [];
        }
      }
      
      // Combine with sample items
      setMediaItems([...userUploadedItems, ...generateSampleMediaItems()]);
      
    } catch (error) {
      console.error("Error loading media items:", error);
      toast({
        title: "Error Loading Media",
        description: "There was a problem loading your media library.",
        variant: "destructive"
      });
      setMediaItems(generateSampleMediaItems());
    }
  }, [isBucketReady, isInitializing]);

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      // Reset upload view when opening dialog
      setIsUploadView(false);
    }
  };

  const handleMediaSelect = (item: MediaItem) => {
    onChange(item.url);
    if (onImageSelect) {
      onImageSelect(item);
    }
    setIsDialogOpen(false);
  };

  const handleUploadComplete = (newItems: MediaItem[]) => {
    console.log("Upload complete, new items:", newItems);
    
    try {
      // Add new items to the beginning of the media collection for visibility
      const updatedItems = [...newItems, ...mediaItems];
      setMediaItems(updatedItems);
      
      // Save just the metadata to localStorage (not the full data URLs)
      const metadataItems = updatedItems.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        type: item.type,
        size: item.size,
        uploadedAt: item.uploadedAt,
        dimensions: item.dimensions
      }));
      
      try {
        localStorage.setItem('mediaItemsIndex', JSON.stringify(metadataItems));
      } catch (storageError) {
        console.error("Failed to save to localStorage:", storageError);
        toast({
          title: "Storage Limit Reached",
          description: "Unable to save all media items to browser storage. Some items may not persist after refresh.",
          variant: "destructive"
        });
      }
      
      // Set to view mode after upload completes
      setIsUploadView(false);
      
      // If there are new items, automatically select the first one
      if (newItems.length > 0) {
        onChange(newItems[0].url);
        if (onImageSelect && newItems[0]) {
          onImageSelect(newItems[0]);
        }
      }
    } catch (error) {
      console.error("Error handling upload completion:", error);
      toast({
        title: "Upload Processing Error",
        description: "There was a problem processing your uploaded files.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMedia = (id: string) => {
    try {
      // Remove from mediaItems list
      const updatedItems = mediaItems.filter(item => item.id !== id);
      setMediaItems(updatedItems);
      
      // Save updated metadata index
      const metadataItems = updatedItems.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        type: item.type,
        size: item.size,
        uploadedAt: item.uploadedAt,
        dimensions: item.dimensions
      }));
      localStorage.setItem('mediaItemsIndex', JSON.stringify(metadataItems));
      
      // Also remove the individual item data if it exists
      try {
        localStorage.removeItem(`media_item_${id}`);
      } catch (e) {
        console.error("Error removing individual media item:", e);
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the media item.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <MediaBucket 
        bucketId={BLOG_MEDIA_BUCKET}
        onInitialized={handleBucketInitialized}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DialogTrigger asChild>
              <Button variant="outline" type="button">
                <ImageIcon className="mr-2 h-4 w-4" />
                Select Image
              </Button>
            </DialogTrigger>
            {value && (
              <Button 
                variant="ghost" 
                type="button" 
                className="text-destructive" 
                onClick={() => onChange("")}
              >
                Clear
              </Button>
            )}
          </div>
          
          {value && (
            <div className="border rounded-md p-2 w-40 h-24">
              <img 
                src={value} 
                alt="Selected image" 
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>
          )}
        </div>
        
        <DialogContent className="max-w-3xl">
          {isInitializing ? (
            <div className="text-center p-8">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p>Initializing media storage...</p>
              </div>
            </div>
          ) : !isBucketReady ? (
            <div className="text-center p-8">
              <div className="flex flex-col items-center justify-center">
                <p className="text-red-500">Failed to initialize media storage.</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsInitializing(true);
                    window.location.reload();
                  }}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : isUploadView ? (
            <div>
              <h3 className="text-lg font-medium mb-4">Upload Media</h3>
              <MediaUploadForm 
                onComplete={handleUploadComplete} 
                onCancel={() => setIsUploadView(false)}
                bucketId={BLOG_MEDIA_BUCKET}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Select an Image</h3>
                <Button onClick={() => setIsUploadView(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New
                </Button>
              </div>
              <MediaGridView 
                items={mediaItems} 
                onDelete={handleDeleteMedia} 
                onSelect={handleMediaSelect}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaSelector;
