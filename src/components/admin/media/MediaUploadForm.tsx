
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { UploadCloud, X, File, CheckCircle, AlertCircle } from "lucide-react";
import { MediaItem } from "./MediaLibrary";
import { uploadOptimizedImage } from "@/lib/storage";
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
        
        // Store the file in localStorage as a data URL for persistence
        const reader = new FileReader();
        
        await new Promise<void>((resolve, reject) => {
          reader.onload = () => {
            const dataUrl = reader.result as string;
            
            // In a real app, we would upload to Supabase or another storage
            // For now, we'll simulate a successful upload and store in localStorage
            
            setTimeout(() => {
              clearInterval(progressInterval);
              
              // Determine file type
              const isImage = file.file.type.startsWith('image/');
              const isVideo = file.file.type.startsWith('video/');
              
              // Create a unique but deterministic ID for the file
              const fileId = `media-${Date.now()}-${file.file.name.replace(/\s+/g, '-').toLowerCase()}`;
              
              // Create a MediaItem from the uploaded file
              const mediaItem: MediaItem = {
                id: fileId,
                name: file.file.name,
                url: isImage ? dataUrl : "/placeholder.svg",
                type: isImage ? 'image' : isVideo ? 'video' : 'document',
                size: file.file.size,
                uploadedAt: new Date().toISOString(),
                // Add dimensions for images
                ...(isImage && { dimensions: { width: 800, height: 600 } })
              };
              
              // Store the media item in localStorage for persistence
              const existingMediaJson = localStorage.getItem('mediaItemsData') || '{}';
              let existingMedia;
              
              try {
                existingMedia = JSON.parse(existingMediaJson);
              } catch (e) {
                existingMedia = {};
              }
              
              existingMedia[fileId] = mediaItem;
              localStorage.setItem('mediaItemsData', JSON.stringify(existingMedia));
              
              // Add to successful uploads
              successfulUploads.push(mediaItem);
              
              // Update file status to complete
              setFiles(prevFiles => 
                prevFiles.map(f => 
                  f.id === file.id ? { ...f, progress: 100, status: 'complete' } : f
                )
              );
              
              resolve();
            }, 1000);
          };
          
          reader.onerror = () => {
            reject(new Error('Failed to read file'));
          };
          
          reader.readAsDataURL(file.file);
        });
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
              className="hidden"
              onChange={handleFileInputChange}
              disabled={isUploading}
            />
          </label>
          <p className="text-xs text-gray-400 mt-2">
            Support for images, videos, and documents up to 10MB
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

