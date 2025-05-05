import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { UploadCloud, X, File, CheckCircle, AlertCircle } from "lucide-react";
import { MediaItem } from "./MediaLibrary";
import { useToast } from "@/hooks/use-toast";

interface MediaUploadFormProps {
  onComplete: (items: MediaItem[]) => void;
  onCancel: () => void;
}

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

// Helper to resize image and reduce quality
const resizeImage = async (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }
        
        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get the resized data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        reject(new Error('Error loading image'));
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    reader.readAsDataURL(file);
  });
};

const MediaUploadForm = ({ onComplete, onCancel }: MediaUploadFormProps) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };
  
  const handleFiles = (fileList: FileList) => {
    const newFiles: UploadFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Unsupported File Type",
          description: `${file.name} is not an image file. Only images are supported currently.`,
          variant: "destructive"
        });
        continue;
      }
      
      // Check file size (limit to 5MB for browser storage)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds the 5MB size limit for browser storage.`,
          variant: "destructive"
        });
        continue;
      }
      
      // Generate a unique ID
      const id = `upload-${Date.now()}-${i}`;
      
      newFiles.push({
        id,
        file,
        progress: 0,
        status: 'pending'
      });
    }
    
    setFiles([...files, ...newFiles]);
  };
  
  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };
  
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    const successfulUploads: MediaItem[] = [];
    
    for (const file of files) {
      // Update status to uploading
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.id === file.id ? { ...f, status: 'uploading' } : f
        )
      );
      
      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setFiles(prevFiles => {
            const fileToUpdate = prevFiles.find(f => f.id === file.id);
            if (fileToUpdate && fileToUpdate.progress < 90) { // Only go up to 90% for simulation
              const newProgress = Math.min(fileToUpdate.progress + Math.random() * 20, 90);
              return prevFiles.map(f => 
                f.id === file.id ? { ...f, progress: newProgress } : f
              );
            } else {
              return prevFiles;
            }
          });
        }, 200);
        
        // Resize image before storage to reduce size
        let dataUrl;
        try {
          dataUrl = await resizeImage(file.file);
        } catch (resizeError) {
          console.error("Error resizing image:", resizeError);
          // Fall back to original if resize fails
          const reader = new FileReader();
          dataUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file.file);
          });
        }
        
        // Create a unique but deterministic ID for the file
        const fileId = `media-${Date.now()}-${file.file.name.replace(/\s+/g, '-').toLowerCase()}`;
          
        // Create a MediaItem from the uploaded file
        const mediaItem: MediaItem = {
          id: fileId,
          name: file.file.name,
          url: dataUrl,
          type: 'image',
          size: file.file.size,
          uploadedAt: new Date().toISOString(),
          dimensions: { width: 800, height: 600 } // Approximate dimensions
        };
          
        // Store each media item individually
        try {
          localStorage.setItem(`media_item_${fileId}`, dataUrl);
          
          // For the index, store a version without the data URL to save space
          const metadataItem = {
            ...mediaItem,
            // Keep the URL as is - we'll retrieve it from storage when needed
          };
          
          // Add to successful uploads
          successfulUploads.push(mediaItem);
          
          clearInterval(progressInterval);
          
          // Update file status to complete
          setFiles(prevFiles => 
            prevFiles.map(f => 
              f.id === file.id ? { ...f, progress: 100, status: 'complete' } : f
            )
          );
        } catch (storageError) {
          console.error('Error storing file:', storageError);
          throw new Error('Storage limit exceeded');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        
        // Update file status to error
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f.id === file.id ? { 
              ...f, 
              status: 'error',
              error: error instanceof Error ? error.message : 'Upload failed'
            } : f
          )
        );
      }
    }
    
    // When all uploads are complete
    if (successfulUploads.length > 0) {
      toast({
        title: "Upload Complete",
        description: `${successfulUploads.length} file(s) uploaded successfully.`
      });
      
      // Wait a moment before completing
      setTimeout(() => {
        onComplete(successfulUploads);
        setIsUploading(false);
      }, 500);
    } else {
      toast({
        title: "Upload Failed",
        description: "No files were uploaded successfully.",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };
  
  const getFileTypeIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <div className="text-blue-500">I</div>;
    } else if (file.type.startsWith('video/')) {
      return <div className="text-purple-500">V</div>;
    } else {
      return <div className="text-amber-500">D</div>;
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <UploadCloud className="h-10 w-10 text-gray-400" />
          <h3 className="font-medium text-lg">Drag and drop files</h3>
          <p className="text-gray-500">or</p>
          <label className="cursor-pointer">
            <Button type="button" variant="outline">
              Browse Files
            </Button>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
              disabled={isUploading}
            />
          </label>
          <p className="text-xs text-gray-400 mt-2">
            Support for images up to 5MB
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Files to upload ({files.length})</h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {files.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                    <File className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {file.status === 'pending' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeFile(file.id)}
                      className="h-7 w-7"
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  )}
                  
                  {file.status === 'uploading' && (
                    <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {file.status === 'complete' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  
                  {file.status === 'error' && (
                    <div className="flex items-center text-red-500">
                      <AlertCircle className="h-5 w-5 mr-1" />
                      <span className="text-xs">{file.error}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
        >
          {isUploading ? (
            <>
              <span className="animate-spin mr-2">○</span>
              Uploading...
            </>
          ) : (
            <>Upload {files.length > 0 ? `(${files.length})` : ''}</>
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default MediaUploadForm;
