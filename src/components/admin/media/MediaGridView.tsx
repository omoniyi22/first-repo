
import { useState } from "react";
import {
  MoreHorizontal,
  Trash2,
  Download,
  ExternalLink,
  Copy,
  Eye,
  FileVideo,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { MediaItem } from "./MediaLibrary";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface MediaGridViewProps {
  items: MediaItem[];
  onDelete: (id: string) => void;
}

const MediaGridView = ({ items, onDelete }: MediaGridViewProps) => {
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const { toast } = useToast();

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "URL Copied",
        description: "The file URL has been copied to your clipboard.",
      });
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive"
      });
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-6 w-6 text-blue-500" />;
      case 'video':
        return <FileVideo className="h-6 w-6 text-purple-500" />;
      case 'document':
        return <FileText className="h-6 w-6 text-amber-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="group relative border rounded-md overflow-hidden bg-gray-50 flex flex-col"
          >
            <div 
              className="h-32 overflow-hidden bg-white flex items-center justify-center cursor-pointer"
              onClick={() => setPreviewItem(item)}
            >
              {item.type === 'image' ? (
                <img 
                  src={item.url} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {getFileIcon(item.type)}
                </div>
              )}
            </div>
            
            <div className="p-2 flex-1 flex flex-col justify-between">
              <div className="overflow-hidden">
                <p className="text-xs font-medium truncate" title={item.name}>
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(item.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setPreviewItem(item)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in new tab
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard(item.url)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy URL
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setItemToDelete(item)}
                      className="text-red-600 hover:text-red-700 focus:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the file:
              <br />
              <span className="font-medium">{itemToDelete?.name}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-4xl">
          <div className="flex flex-col space-y-4">
            <div className="flex-1 flex items-center justify-center min-h-[300px] bg-gray-100 rounded-md">
              {previewItem?.type === 'image' ? (
                <img 
                  src={previewItem.url} 
                  alt={previewItem.name} 
                  className="max-h-[70vh] max-w-full object-contain"
                />
              ) : previewItem?.type === 'video' ? (
                <div className="text-center p-6">
                  <FileVideo className="h-16 w-16 mx-auto text-purple-500 mb-4" />
                  <p className="text-lg font-medium">Video Preview</p>
                  <p className="text-gray-500">
                    Duration: {Math.floor((previewItem.duration || 0) / 60)}:{String((previewItem.duration || 0) % 60).padStart(2, '0')}
                  </p>
                  <Button className="mt-4" asChild>
                    <a href={previewItem.url} target="_blank" rel="noopener noreferrer">
                      Open Video
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="text-center p-6">
                  <FileText className="h-16 w-16 mx-auto text-amber-500 mb-4" />
                  <p className="text-lg font-medium">Document Preview</p>
                  <Button className="mt-4" asChild>
                    <a href={previewItem.url} target="_blank" rel="noopener noreferrer">
                      Open Document
                    </a>
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{previewItem?.name}</p>
                <p className="text-sm text-gray-500">
                  {previewItem?.type === 'image' && previewItem?.dimensions ? 
                    `${previewItem.dimensions.width} × ${previewItem.dimensions.height}` : 
                    previewItem?.type.charAt(0).toUpperCase() + (previewItem?.type.slice(1) || '')
                  }
                </p>
              </div>
              
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(previewItem?.url || '')}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy URL
                </Button>
                <Button 
                  size="sm" 
                  asChild
                >
                  <a href={previewItem?.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MediaGridView;
