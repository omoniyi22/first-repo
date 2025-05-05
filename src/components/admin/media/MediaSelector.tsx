
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, Upload } from "lucide-react";
import { MediaItem } from "./MediaLibrary";
import MediaGridView from "./MediaGridView";
import MediaUploadForm from "./MediaUploadForm";

interface MediaSelectorProps {
  value: string;
  onChange: (url: string) => void;
  onImageSelect?: (mediaItem: MediaItem) => void;
}

const MediaSelector = ({ value, onChange, onImageSelect }: MediaSelectorProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploadView, setIsUploadView] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  
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
    // Try to load items from local storage first
    const savedItems = localStorage.getItem('mediaItems');
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems);
        setMediaItems(parsedItems);
      } catch (e) {
        console.error("Error parsing saved media items:", e);
        setMediaItems(generateSampleMediaItems());
      }
    } else if (mediaItems.length === 0) {
      setMediaItems(generateSampleMediaItems());
    }
  }, []);

  // Save media items to local storage whenever they change
  useEffect(() => {
    if (mediaItems.length > 0) {
      localStorage.setItem('mediaItems', JSON.stringify(mediaItems));
    }
  }, [mediaItems]);

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
    // Add new items to the beginning of the media collection for visibility
    const updatedItems = [...newItems, ...mediaItems];
    setMediaItems(updatedItems);
    
    // Set to view mode after upload completes
    setIsUploadView(false);
    
    // If there are new items, automatically select the first one
    if (newItems.length > 0) {
      onChange(newItems[0].url);
      if (onImageSelect && newItems[0]) {
        onImageSelect(newItems[0]);
      }
    }
    
    // Save to localStorage
    localStorage.setItem('mediaItems', JSON.stringify(updatedItems));
  };

  const handleDeleteMedia = (id: string) => {
    const updatedItems = mediaItems.filter(item => item.id !== id);
    setMediaItems(updatedItems);
    localStorage.setItem('mediaItems', JSON.stringify(updatedItems));
  };

  return (
    <div className="space-y-4">
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
          {isUploadView ? (
            <div>
              <h3 className="text-lg font-medium mb-4">Upload Media</h3>
              <MediaUploadForm 
                onComplete={handleUploadComplete} 
                onCancel={() => setIsUploadView(false)} 
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
