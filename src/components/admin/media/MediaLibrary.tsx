
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  UploadCloud,
  Folder,
  Grid,
  List,
  Search,
  Filter,
  Image as ImageIcon,
  FileVideo,
  FileText,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MediaUploadForm from "@/components/admin/media/MediaUploadForm";
import MediaGridView from "@/components/admin/media/MediaGridView";
import MediaListView from "@/components/admin/media/MediaListView";

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploadedAt: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // for videos
}

const MediaLibrary = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedType, setSelectedType] = useState<string>("all");
  const { toast } = useToast();
  
  useEffect(() => {
    // In a real app, this would fetch from your Supabase storage
    const mockMediaItems: MediaItem[] = [
      {
        id: "1",
        name: "dressage-test-01.jpg",
        url: "/lovable-uploads/e2cfe504-4899-4458-9af3-b8deb0a24a4b.png",
        type: "image",
        size: 2500000,
        uploadedAt: "2025-04-20T14:30:00Z",
        dimensions: {
          width: 1920,
          height: 1080
        }
      },
      {
        id: "2",
        name: "jumping-competition.mp4",
        url: "/lovable-uploads/photo-1438565434616-3ef039228b15.jpeg",
        type: "video",
        size: 15000000,
        uploadedAt: "2025-04-18T10:15:00Z",
        duration: 120
      },
      {
        id: "3",
        name: "training-notes.pdf",
        url: "/placeholder.svg",
        type: "document",
        size: 500000,
        uploadedAt: "2025-04-15T09:00:00Z"
      },
      {
        id: "4",
        name: "horse-profile.jpg",
        url: "/lovable-uploads/photo-1472396961693-142e6e269027.jpeg",
        type: "image",
        size: 1800000,
        uploadedAt: "2025-04-10T16:45:00Z",
        dimensions: {
          width: 1600,
          height: 900
        }
      },
      {
        id: "5",
        name: "dressage-competition.mp4",
        url: "/lovable-uploads/2d7d12d5-7cbc-4747-878c-897c94ab8d18.png",
        type: "video",
        size: 18000000,
        uploadedAt: "2025-04-05T11:30:00Z",
        duration: 180
      }
    ];
    
    setMediaItems(mockMediaItems);
  }, []);

  const filteredMediaItems = mediaItems.filter(item => {
    // Filter by search term
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by type
    const matchesType = selectedType === "all" || item.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleUploadComplete = (newItems: MediaItem[]) => {
    setMediaItems([...newItems, ...mediaItems]);
    setIsUploading(false);
    toast({
      title: "Upload Complete",
      description: `${newItems.length} files have been uploaded successfully.`,
    });
  };

  const handleDeleteMedia = (id: string) => {
    // In a real app, this would call your Supabase delete function
    setMediaItems(mediaItems.filter(item => item.id !== id));
    toast({
      title: "File Deleted",
      description: "The file has been deleted successfully.",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getTotalSize = () => {
    const totalBytes = mediaItems.reduce((acc, item) => acc + item.size, 0);
    return formatFileSize(totalBytes);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-500">Manage your media files</p>
        </div>
        <Button onClick={() => setIsUploading(true)}>
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search files..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all" value={selectedType} onValueChange={setSelectedType} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="image">Images</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="document">Documents</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
            <span className="sr-only">Grid View</span>
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
            <span className="sr-only">List View</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Sort by Name</DropdownMenuItem>
              <DropdownMenuItem>Sort by Date</DropdownMenuItem>
              <DropdownMenuItem>Sort by Size</DropdownMenuItem>
              <DropdownMenuItem>Sort by Type</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {filteredMediaItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-3 inline-flex justify-center mb-4">
                <Folder className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">No files found</h3>
              <p className="text-gray-500 mt-1">
                {searchTerm 
                  ? "No files match your search criteria" 
                  : "Upload some files to get started"
                }
              </p>
              {searchTerm && (
                <Button 
                  variant="link" 
                  onClick={() => setSearchTerm("")} 
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
              {!searchTerm && (
                <Button 
                  className="mt-4" 
                  onClick={() => setIsUploading(true)}
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <MediaGridView 
              items={filteredMediaItems} 
              onDelete={handleDeleteMedia} 
            />
          ) : (
            <MediaListView 
              items={filteredMediaItems} 
              onDelete={handleDeleteMedia}
              formatFileSize={formatFileSize}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center text-sm text-gray-500 px-1">
        <div>
          {filteredMediaItems.length} items
          {filteredMediaItems.length !== mediaItems.length && ` (filtered from ${mediaItems.length})`}
        </div>
        <div>Total size: {getTotalSize()}</div>
      </div>

      <Dialog open={isUploading} onOpenChange={setIsUploading}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>
              Upload images, videos, or documents to your media library.
            </DialogDescription>
          </DialogHeader>
          
          <MediaUploadForm 
            onComplete={handleUploadComplete} 
            onCancel={() => setIsUploading(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaLibrary;
