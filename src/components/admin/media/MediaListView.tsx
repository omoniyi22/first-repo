
import { useState } from "react";
import {
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Copy,
  Eye,
  FileVideo,
  FileText,
  Image as ImageIcon,
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
import { MediaItem } from "@/services/mediaService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MediaListViewProps {
  items: MediaItem[];
  onDelete: (id: string) => void;
  formatFileSize: (bytes: number) => string;
  onSelect?: (item: MediaItem) => void;
}

const MediaListView = ({
  items,
  onDelete,
  formatFileSize,
  onSelect,
}: MediaListViewProps) => {
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast({
          title: "URL Copied",
          description: "The file URL has been copied to your clipboard.",
        });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Copy Failed",
          description: "Failed to copy URL to clipboard.",
          variant: "destructive",
        });
      });
  };

  const handleImageError = (itemId: string) => {
    setBrokenImages((prev) => new Set(prev).add(itemId));
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4 text-blue-500" />;
      case "video":
        return <FileVideo className="h-4 w-4 text-purple-500" />;
      case "document":
        return <FileText className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleItemClick = (item: MediaItem) => {
    if (onSelect) {
      onSelect(item);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No media files yet</h3>
        <p className="text-gray-500">Upload your first image to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Dimensions</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                className={onSelect ? "cursor-pointer hover:bg-gray-50" : ""}
                onClick={() => handleItemClick(item)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {item.file_type === "image" && !brokenImages.has(item.id) ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="h-10 w-10 rounded object-cover"
                          onError={() => handleImageError(item.id)}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                          {getFileIcon(item.file_type)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500 truncate">{item.original_name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {item.file_type.charAt(0).toUpperCase() + item.file_type.slice(1)}
                  </span>
                </TableCell>
                <TableCell>{formatFileSize(item.file_size)}</TableCell>
                <TableCell>
                  {item.width && item.height ? `${item.width} × ${item.height}px` : '-'}
                </TableCell>
                <TableCell>
                  {new Date(item.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(item.url, "_blank");
                    }}
                  >
                    <span>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Preview</span>
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(item.url);
                    }}
                    className="h-8 w-8"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy URL</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem
                        onClick={() => window.open(item.url, "_blank")}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open in new tab
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => copyToClipboard(item.url)}
                      >
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              file:
              <br />
              <span className="font-medium">{itemToDelete?.name}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MediaListView;
