
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
// Create a unique ID for this instance to prevent duplicates across components
const INSTANCE_ID = Math.random().toString(36).substring(2, 9);

const MediaSelector = ({ value, onChange, onImageSelect }: MediaSelectorProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploadView, setIsUploadView] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isBucketReady, setIsBucketReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();
  
  // Handle bucket initialization
  const handleBucketInitialized = (success: boolean) => {
    console.log("MediaSelector: Bucket initialization complete, success:", success);
    setIsBucketReady(success);
    setIsInitializing(false);
  };
  
  // Generate a stable storage key for this bucket
  const getStorageKey = () => `mediaItemsIndex_${BLOG_MEDIA_BUCKET}`;
  
  // Process media items and remove duplicates by URL and file hash
  const processDuplicates = (items: MediaItem[]) => {
    // Create maps to track seen URLs and file hashes
    const seenUrls = new Map<string, boolean>();
    const seenHashes = new Map<string, boolean>();
    const uniqueItems: MediaItem[] = [];
    
    for (const item of items) {
      // Skip items with no URL
      if (!item.url) continue;
      
      // Check if we've seen this URL or file hash before
      const isDuplicate = seenUrls.has(item.url) || 
                          (item.id && item.id.startsWith('hash_') && seenHashes.has(item.id.substring(5)));
      
      if (!isDuplicate) {
        // Add to seen maps
        seenUrls.set(item.url, true);
        if (item.id && item.id.startsWith('hash_')) {
          seenHashes.set(item.id.substring(5), true);
        }
        // Add to unique items
        uniqueItems.push(item);
      }
    }
    
    return uniqueItems;
  };
  
  // Save currently loaded media items to localStorage
  const saveMediaItems = (items: MediaItem[]) => {
    try {
      // Save just the metadata (without the full data URLs) to localStorage
      const metadataItems = items.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        type: item.type,
        size: item.size,
        uploadedAt: item.uploadedAt,
        dimensions: item.dimensions
      }));
      
      localStorage.setItem(getStorageKey(), JSON.stringify(metadataItems));
      console.log(`Saved ${metadataItems.length} items to localStorage index`);
    } catch (error) {
      console.error("Error saving media items to localStorage:", error);
    }
  };
  
  // Helper to ensure data URLs are properly saved to local storage
  const ensureDataUrlPersistence = (item: MediaItem) => {
    if (item.url && item.url.startsWith('data:')) {
      try {
        // Save the data URL under the item's ID
        const storageKey = `media_item_${item.id}`;
        localStorage.setItem(storageKey, item.url);
        console.log(`Saved data URL for item ${item.id} to localStorage`);
      } catch (error) {
        console.error(`Failed to save data URL for item ${item.id}:`, error);
      }
    }
  };
  
  // Helper to ensure data URLs for all items are stored
  const ensureAllDataUrlsPersisted = (items: MediaItem[]) => {
    items.forEach(item => {
      if (item.url?.startsWith('data:')) {
        ensureDataUrlPersistence(item);
      }
    });
  };
  
  // Load media items when component mounts
  useEffect(() => {
    // Always load some default media
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
    
    let allItems: MediaItem[] = [...sampleImages];
    
    // Try to load saved items if storage is initialized
    if (!isInitializing) {
      console.log("Loading media items, bucket ready:", isBucketReady);
      try {
        // Get the media item metadata from localStorage 
        const mediaItemsIndex = localStorage.getItem(getStorageKey());
        let userUploadedItems: MediaItem[] = [];
        
        if (mediaItemsIndex) {
          try {
            userUploadedItems = JSON.parse(mediaItemsIndex);
            console.log("Loaded user uploaded items metadata:", userUploadedItems.length);
            
            // Check for any data URLs in localStorage and restore them
            userUploadedItems = userUploadedItems.map(item => {
              if (item.id) {
                const storedDataUrl = localStorage.getItem(`media_item_${item.id}`);
                if (storedDataUrl && (item.url.startsWith('data:') || item.url.startsWith('blob:'))) {
                  console.log(`Restored data URL for item ${item.id}`);
                  return { ...item, url: storedDataUrl };
                }
              }
              return item;
            });
            
            // Add user items to the beginning for visibility
            allItems = [...userUploadedItems, ...sampleImages];
          } catch (e) {
            console.error("Error parsing media items index:", e);
          }
        }
      } catch (error) {
        console.error("Error loading media items:", error);
        toast({
          title: "Error Loading Media",
          description: "There was a problem loading your media library.",
          variant: "destructive"
        });
      }
    }
    
    // Remove duplicates and set items
    const uniqueItems = processDuplicates(allItems);
    setMediaItems(uniqueItems);
    
    // Ensure all data URLs are persisted
    ensureAllDataUrlsPersisted(uniqueItems);
    
  }, [isBucketReady, isInitializing, toast]);
  
  // Special handling for the currently selected image value
  useEffect(() => {
    if (!value) return;
    
    // If the value is a data URI, we need to preserve it persistently
    if (value.startsWith('data:') || value.startsWith('blob:')) {
      // Try to save the data URI to localStorage for persistence
      try {
        const savedItemId = `current_selected_image_${INSTANCE_ID}`;
        localStorage.setItem(savedItemId, value);
        
        // Check if this image is already in our media items
        const existingItem = mediaItems.find(item => item.url === value);
        
        // If not, we should create an entry for it to ensure it persists
        if (!existingItem && !isInitializing) {
          const newItem: MediaItem = {
            id: `selected_${INSTANCE_ID}`,
            name: `Selected Image ${INSTANCE_ID}`,
            url: value,
            type: "image",
            size: 0,
            uploadedAt: new Date().toISOString()
          };
          
          // Add to media items and save
          const updatedItems = [newItem, ...mediaItems];
          setMediaItems(updatedItems);
          saveMediaItems(updatedItems);
        }
      } catch (e) {
        console.error("Failed to save image data URI:", e);
      }
    }
  }, [value, mediaItems, isInitializing]);

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      // Reset upload view when opening dialog
      setIsUploadView(false);
    }
  };

  const handleMediaSelect = (item: MediaItem) => {
    // If it's a data URL, ensure it's persisted
    if (item.url.startsWith('data:')) {
      ensureDataUrlPersistence(item);
    }
    
    onChange(item.url);
    if (onImageSelect) {
      onImageSelect(item);
    }
    setIsDialogOpen(false);
  };

  const handleUploadComplete = (newItems: MediaItem[]) => {
    console.log("Upload complete, new items:", newItems);
    
    try {
      // First ensure all data URLs in the new items are persisted
      newItems.forEach(item => {
        if (item.url.startsWith('data:')) {
          ensureDataUrlPersistence(item);
        }
      });
      
      // Add new items to the beginning of the media collection for visibility
      // But first, merge with existing items and remove duplicates
      const updatedItems = processDuplicates([...newItems, ...mediaItems]);
      setMediaItems(updatedItems);
      
      // Save to localStorage
      saveMediaItems(updatedItems);
      
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
      // Find the item before we remove it
      const itemToDelete = mediaItems.find(item => item.id === id);
      
      // Remove from mediaItems list
      const updatedItems = mediaItems.filter(item => item.id !== id);
      setMediaItems(updatedItems);
      
      // Update localStorage index
      saveMediaItems(updatedItems);
      
      // Also remove the individual data URL item if it exists
      if (itemToDelete?.url.startsWith('data:')) {
        try {
          localStorage.removeItem(`media_item_${id}`);
          console.log(`Removed data URL for item ${id} from localStorage`);
        } catch (e) {
          console.error("Error removing individual media item:", e);
        }
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
                {!isBucketReady && (
                  <div className="p-2 bg-gray-50 rounded-md text-xs text-gray-500 flex items-center justify-between">
                    <span>Using browser storage - uploads may not persist across devices</span>
                  </div>
                )}
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
