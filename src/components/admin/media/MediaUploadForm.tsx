import { useState, useCallback, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { generateFileHash, uploadImage } from "@/lib/storage";
import { MediaItem } from "./MediaLibrary";

interface MediaUploadFormProps {
  onComplete: (files: File[]) => Promise<void>;
  onCancel: () => void;
  bucketId?: string; // Keep for compatibility but not used
}

const MediaUploadForm = ({ onComplete, onCancel }: MediaUploadFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
    setUploadProgress(0);
    
    const uploadedItems: MediaItem[] = [];
    let successCount = 0;
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Generate file hash for deduplication
        const fileHash = await generateFileHash(file);
        const fileId = `hash_${fileHash}`;
        
        try {
          console.log(`Uploading file: ${file.name}`);
          
          // Upload using storage service
          const result = await uploadImage(file);
          
          if (result.success && result.publicUrl) {
            console.log(`File uploaded successfully: ${result.publicUrl}`);
            
            // Create a MediaItem from the uploaded file
            const mediaItem: MediaItem = {
              id: fileId,
              name: file.name,
              url: result.publicUrl,
              type: "image",
              size: file.size,
              uploadedAt: new Date().toISOString(),
              dimensions: {
                width: result.width,
                height: result.height
              }
            };
            
            uploadedItems.push(mediaItem);
            successCount++;
          } else {
            console.error("Upload failed for file", file.name, result.error);
            toast({
              title: "Upload Failed",
              description: `Failed to upload ${file.name}. ${result.error || "Unknown error"}`,
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Error uploading file:", file.name, error);
          toast({
            title: "Upload Error",
            description: `Error uploading ${file.name}. Please try again.`,
            variant: "destructive"
          });
        }
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }
      
      if (successCount === 0) {
        toast({
          title: "Upload Failed",
          description: "All file uploads failed. Please try again.",
          variant: "destructive"
        });
      } else if (successCount < selectedFiles.length) {
        toast({
          title: "Partial Upload Success",
          description: `${successCount} of ${selectedFiles.length} files uploaded successfully.`,
        });
      } else {
        toast({
          title: "Upload Complete",
          description: `${successCount} files uploaded successfully.`,
        });
      }
      
      // Call onComplete with the uploaded items
      if (uploadedItems.length > 0) {
        onComplete(uploadedItems);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your files.",
        variant: "destructive"
      });
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
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors hover:border-primary"
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
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 font-medium">Click to browse or drag and drop</p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
        </label>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected files ({files.length}):</p>
          <div className="max-h-32 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
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
          <p className="text-sm text-center text-gray-500">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
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
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : ''}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default MediaUploadForm;
