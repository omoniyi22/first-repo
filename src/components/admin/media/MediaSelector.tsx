import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  ImageIcon, 
  Upload, 
  Loader2, 
  Trash2, 
  Copy, 
  ExternalLink,
  Info,
  X,
  Check,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Define the MediaItem interface
interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  width?: number;
  height?: number;
  description?: string;
}

interface MediaMetadata {
  width?: number;
  height?: number;
  size: number;
  type: string;
  uploadedAt: string;
}

interface MediaSelectorProps {
  value: string;
  onChange: (url: string) => void;
  onImageSelect?: (mediaItem: MediaItem) => void;
}

// Define the storage bucket name
const STORAGE_BUCKET = "blog-images";

const MediaSelector = ({ value, onChange, onImageSelect }: MediaSelectorProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploadView, setIsUploadView] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isImageInfoOpen, setIsImageInfoOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check authentication status
  const checkAuth = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth session error:", error);
        return false;
      }
      
      if (!data?.session?.user) {
        console.warn("No authenticated user found");
        return false;
      }
      
      console.log("Authenticated as:", data.session.user.email);
      return true;
    } catch (error) {
      console.error("Error checking auth:", error);
      return false;
    }
  };

  // Load media items from storage
  const loadMediaItems = async () => {
    setIsLoading(true);
    
    try {
      console.log(`Loading files from bucket: ${STORAGE_BUCKET}`);
      
      // Check auth status
      const isAuthenticated = await checkAuth();
      console.log("Authentication status:", isAuthenticated);
      
      // Try to list files in the bucket
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list();
        
      if (error) {
        console.error("Error loading files:", error);
        toast({
          title: "Storage Access Error",
          description: `Unable to access files: ${error.message}`,
          variant: "destructive",
        });
        
        // Fall back to sample images
        const samples = getSampleImages();
        setMediaItems(samples);
        setFilteredItems(samples);
        setIsLoading(false);
        return;
      }
      
      console.log(`Loaded ${data?.length || 0} files from storage`);
      
      if (!data || data.length === 0) {
        // Use sample images if no images are found
        const samples = getSampleImages();
        setMediaItems(samples);
        setFilteredItems(samples);
        setIsLoading(false);
        return;
      }
      
      // Process files to get URLs and metadata
      const items: MediaItem[] = await Promise.all(
        data
          .filter(file => !file.name.includes('/') && !file.metadata?.mimetype?.startsWith('video/'))
          .map(async (file) => {
            // Get public URL for the file
            const { data: publicUrlData } = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(file.name);
              
            return {
              id: file.id || file.name,
              name: file.name,
              url: publicUrlData.publicUrl,
              type: getFileType(file.name),
              size: file.metadata?.size || 0,
              uploadedAt: file.created_at || new Date().toISOString(),
              width: file.metadata?.width,
              height: file.metadata?.height
            };
          })
      );
      
      setMediaItems(items);
      setFilteredItems(items);
      
    } catch (error) {
      console.error("Unexpected error loading media:", error);
      toast({
        title: "Error Loading Media",
        description: "Failed to load media items. Using sample images instead.",
        variant: "destructive",
      });
      
      // Fallback to sample images
      const samples = getSampleImages();
      setMediaItems(samples);
      setFilteredItems(samples);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters based on search and sort
  useEffect(() => {
    if (!mediaItems.length) return;
    
    let filtered = [...mediaItems];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return sortDirection === "desc" 
          ? new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          : new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      } else if (sortBy === "name") {
        return sortDirection === "desc"
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      } else if (sortBy === "size") {
        return sortDirection === "desc"
          ? b.size - a.size
          : a.size - b.size;
      }
      return 0;
    });
    
    setFilteredItems(filtered);
  }, [mediaItems, searchQuery, sortBy, sortDirection]);

  // Helper to determine file type from name
  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
      return 'image';
    }
    return 'file';
  };
  
  // Format file size into readable string
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format date into readable string
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  // Sample images for fallback
  const getSampleImages = (): MediaItem[] => {
    return [
      { 
        id: "sample1", 
        name: "Sample Mountain.jpg", 
        url: "https://images.unsplash.com/photo-1518770660439-4636190af475",
        type: "image", 
        size: 1024000,
        uploadedAt: new Date().toISOString(),
        width: 1200,
        height: 800,
        description: "Beautiful mountain landscape with snow"
      },
      { 
        id: "sample2", 
        name: "Sample Tech.jpg", 
        url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
        type: "image", 
        size: 2048000,
        uploadedAt: new Date().toISOString(),
        width: 1600, 
        height: 900,
        description: "Technology and code"
      },
      { 
        id: "sample3", 
        name: "Sample Nature.jpg", 
        url: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
        type: "image", 
        size: 1536000,
        uploadedAt: new Date().toISOString(),
        width: 1800,
        height: 1200,
        description: "Stunning natural landscape"
      }
    ];
  };

  // Load media items on component mount
  useEffect(() => {
    if (isDialogOpen) {
      loadMediaItems();
    }
  }, [isDialogOpen]);

  // Handle dialog open/close
  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      // Reset the state when opening
      setIsUploadView(false);
      setSearchQuery("");
      setSelectedItem(null);
      setIsImageInfoOpen(false);
    }
  };

  // Handle media item selection
  const handleMediaSelect = (item: MediaItem) => {
    onChange(item.url);
    if (onImageSelect) {
      onImageSelect(item);
    }
    setIsDialogOpen(false);
  };

  // Handle direct file upload (drag & drop or select)
  const handleDirectUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Copy URL to clipboard
  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      toast({
        title: "Copied to clipboard",
        description: "Image URL has been copied to clipboard",
      });
      
      // Reset copy icon after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    });
  };
  
  // Open image in new tab
  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  // Handle file uploads
  const handleUploadComplete = async (files: File[]) => {
    try {
      console.log(`Starting upload of ${files.length} files to ${STORAGE_BUCKET}`);
      const newItems: MediaItem[] = [];
      
      for (const file of files) {
        // Generate a unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        console.log(`Uploading ${file.name} as ${fileName}`);
        
        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (error) {
          console.error(`Error uploading ${fileName}:`, error);
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}: ${error.message}`,
            variant: "destructive"
          });
          continue; // Skip to next file
        }
        
        console.log(`Successfully uploaded ${fileName}`);
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(fileName);
          
        // Create media item
        const newItem: MediaItem = {
          id: data?.path || fileName,
          name: file.name,
          url: publicUrlData.publicUrl,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          size: file.size,
          uploadedAt: new Date().toISOString()
        };
        
        newItems.push(newItem);
      }
      
      if (newItems.length === 0) {
        toast({
          title: "Upload Failed",
          description: "No files were uploaded successfully",
          variant: "destructive"
        });
        return;
      }
      
      // Update state with new items
      setMediaItems(prevItems => [...newItems, ...prevItems]);
      
      // Switch back to browse view
      setIsUploadView(false);
      
      // Auto-select first uploaded image
      if (newItems.length > 0) {
        onChange(newItems[0].url);
        if (onImageSelect) {
          onImageSelect(newItems[0]);
        }
      }
      
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${newItems.length} file(s)`,
      });
    } catch (error) {
      console.error("Unexpected upload error:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your files.",
        variant: "destructive"
      });
    }
  };

  // Handle media deletion
  const handleDeleteMedia = async (id: string) => {
    try {
      // Prevent deletion of sample images
      if (id.startsWith('sample')) {
        toast({
          title: "Cannot Delete Sample Image",
          description: "Sample images cannot be deleted.",
          variant: "default"
        });
        return;
      }
      
      // Get the item before deleting
      const itemToDelete = mediaItems.find(item => item.id === id);
      if (!itemToDelete) {
        console.warn("Item not found for deletion:", id);
        return;
      }
      
      console.log(`Attempting to delete ${itemToDelete.name} with ID ${id}`);
      
      // Extract the filename from the URL or use the id if it contains the filename
      let filename = itemToDelete.name;
      if (id.includes('/')) {
        filename = id; // Use the id as path if it contains a path
      }
      
      console.log(`Deleting file: ${filename}`);
      
      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filename]);
        
      if (error) {
        console.error("Error deleting file:", error);
        toast({
          title: "Delete Failed",
          description: `Error: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      console.log(`Successfully deleted ${filename}`);
      
      // Update state
      setMediaItems(prevItems => prevItems.filter(item => item.id !== id));
      
      // If the deleted item was selected, clear selection
      if (value === itemToDelete.url) {
        onChange("");
      }
      
      toast({
        title: "Image Deleted",
        description: "The image was successfully deleted."
      });
    } catch (error) {
      console.error("Unexpected delete error:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the image.",
        variant: "destructive"
      });
    }
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  // Media Upload Form Component
  const MediaUploadForm = ({ 
    onComplete 
  }: { 
    onComplete: (files: File[]) => Promise<void> 
  }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    
    // Handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFiles = Array.from(e.target.files);
        // Only accept images
        const imageFiles = selectedFiles.filter(file => 
          file.type.startsWith('image/')
        );
        
        if (imageFiles.length !== selectedFiles.length) {
          toast({
            title: "Invalid Files",
            description: "Only image files are allowed.",
            variant: "destructive"
          });
        }
        
        setFiles(imageFiles);
      }
    };
    
    // Handle drop event
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        // Only accept images
        const imageFiles = droppedFiles.filter(file => 
          file.type.startsWith('image/')
        );
        
        if (imageFiles.length !== droppedFiles.length) {
          toast({
            title: "Invalid Files",
            description: "Only image files are allowed.",
            variant: "destructive"
          });
        }
        
        setFiles(imageFiles);
      }
    };
    
    // Highlight drop zone on drag over
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (dropZoneRef.current) {
        dropZoneRef.current.classList.add('border-primary');
      }
    };
    
    // Remove highlight on drag leave
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (dropZoneRef.current) {
        dropZoneRef.current.classList.remove('border-primary');
      }
    };
    
    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (files.length === 0) return;
      
      setIsUploading(true);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);
      
      try {
        await onComplete(files);
        setFiles([]);
        setUploadProgress(100);
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        clearInterval(progressInterval);
        setIsUploading(false);
        setUploadProgress(0);
      }
    };
    
    // Remove file from selection
    const removeFile = (index: number) => {
      setFiles(prev => prev.filter((_, i) => i !== index));
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div 
          ref={dropZoneRef}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <label className="cursor-pointer block">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleFileChange}
              className="hidden" 
              disabled={isUploading}
            />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Click to browse or drag and drop</p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </label>
        </div>
        
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected files ({files.length}):</p>
            <ul className="text-sm max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <li key={index} className="flex justify-between items-center py-1 px-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-600 truncate max-w-[250px]">
                    {file.name} - {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {isUploading && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-center text-gray-500">{uploadProgress}% uploaded</p>
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsUploadView(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={files.length === 0 || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </div>
      </form>
    );
  };

  // Image Information Panel
  const ImageInfoPanel = ({ item }: { item: MediaItem }) => {
    return (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-medium">Image Details</h3>
        
        <div className="aspect-square max-w-md mx-auto bg-gray-50 rounded overflow-hidden">
          <img 
            src={item.url} 
            alt={item.name}
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-medium">Filename:</div>
          <div className="truncate">{item.name}</div>
          
          <div className="font-medium">Dimensions:</div>
          <div>{item.width && item.height ? `${item.width} × ${item.height}px` : 'Unknown'}</div>
          
          <div className="font-medium">Size:</div>
          <div>{formatFileSize(item.size)}</div>
          
          <div className="font-medium">Type:</div>
          <div>{item.type}</div>
          
          <div className="font-medium">Uploaded:</div>
          <div>{formatDate(item.uploadedAt)}</div>
          
          <div className="font-medium">URL:</div>
          <div className="truncate">
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {item.url}
            </a>
          </div>
        </div>
        
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => copyToClipboard(item.url, item.id)}
          >
            {copiedId === item.id ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            Copy URL
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => openInNewTab(item.url)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
          
          {!item.id.startsWith('sample') && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Image</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this image? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      handleDeleteMedia(item.id);
                      setIsImageInfoOpen(false);
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    );
  };

  // Media Grid Component
  const MediaGridView = ({ 
    items, 
    onSelect, 
    onDelete,
    onViewInfo 
  }: { 
    items: MediaItem[]; 
    onSelect: (item: MediaItem) => void; 
    onDelete: (id: string) => void;
    onViewInfo: (item: MediaItem) => void;
  }) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-1">
        {items.length === 0 ? (
          <div className="col-span-4 py-8 text-center text-gray-500">
            No media items found.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="relative group rounded-md overflow-hidden border bg-white">
              <div 
                className="aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden"
                onClick={() => onSelect(item)}
              >
                <img 
                  src={item.url} 
                  alt={item.name}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>
              
              <div className="p-2 flex justify-between items-center text-xs">
                <div className="truncate" title={item.name}>
                  {item.name}
                </div>
                
                <div className="flex items-center space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={() => onViewInfo(item)}
                        >
                          <Info className="h-3.5 w-3.5 text-gray-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View image details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"/>
                          <circle cx="19" cy="12" r="1"/>
                          <circle cx="5" cy="12" r="1"/>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => copyToClipboard(item.url, item.id)}>
                        {copiedId === item.id ? 
                          <Check className="mr-2 h-4 w-4" /> :
                          <Copy className="mr-2 h-4 w-4" />
                        }
                        <span>Copy link</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openInNewTab(item.url)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        <span>Open in new tab</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {!item.id.startsWith('sample') && (
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600" 
                          onClick={() => onDelete(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // Main return
  return (
    <div className="space-y-4">
      {/* Hidden file input for direct upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleUploadComplete(Array.from(e.target.files));
          }
        }}
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
            <Button
              variant="ghost"
              type="button"
              onClick={handleDirectUpload}
              className="text-primary"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
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
            <div className="border rounded-md p-2 w-40 h-24 bg-gray-50">
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
        
        <DialogContent className="max-w-4xl">
          <DialogTitle>Media Library</DialogTitle>
          
          {isLoading ? (
            <div className="text-center p-8">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p>Loading media library...</p>
              </div>
            </div>
          ) : isImageInfoOpen && selectedItem ? (
            <ImageInfoPanel item={selectedItem} />
          ) : isUploadView ? (
            <div>
              <h3 className="text-lg font-medium mb-4">Upload Images</h3>
              <MediaUploadForm onComplete={handleUploadComplete} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-64">
                  <Input
                    placeholder="Search images..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Filter className="h-4 w-4" />
                        Sort
                        {sortDirection === "asc" ? 
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h4"/><path d="M11 16h7"/><path d="M11 20h10"/></svg> : 
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/></svg>
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Sort by</div>
                        <div className="flex flex-col space-y-1">
                          <Button 
                            variant={sortBy === "date" ? "secondary" : "ghost"}
                            size="sm"
                            className="justify-start"
                            onClick={() => {
                              setSortBy("date");
                            }}
                          >
                            Date uploaded
                          </Button>
                          <Button 
                            variant={sortBy === "name" ? "secondary" : "ghost"}
                            size="sm"
                            className="justify-start"
                            onClick={() => {
                              setSortBy("name");
                            }}
                          >
                            Name
                          </Button>
                          <Button 
                            variant={sortBy === "size" ? "secondary" : "ghost"}
                            size="sm"
                            className="justify-start"
                            onClick={() => {
                              setSortBy("size");
                            }}
                          >
                            File size
                          </Button>
                        </div>
                        
                        <div className="border-t pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={toggleSortDirection}
                          >
                            {sortDirection === "asc" ? "Ascending" : "Descending"}
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Badge variant="outline" className="gap-1">
                    {filteredItems.length} items
                  </Badge>
                  
                  <Button variant="default" onClick={() => setIsUploadView(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New
                  </Button>
                </div>
              </div>
              
              <MediaGridView 
                items={filteredItems} 
                onDelete={handleDeleteMedia}
                onSelect={handleMediaSelect}
                onViewInfo={(item) => {
                  setSelectedItem(item);
                  setIsImageInfoOpen(true);
                }}
              />
              
              {isImageInfoOpen && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsImageInfoOpen(false)}
                  >
                    Back to Gallery
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaSelector;