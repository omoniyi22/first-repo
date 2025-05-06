import { useState, useCallback, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { uploadOptimizedImage } from "@/lib/storage";
import { MediaItem } from "./MediaLibrary";

interface MediaUploadFormProps {
  onComplete: (mediaItems: MediaItem[]) => void;
  onCancel: () => void;
  bucketId?: string;
}

const MediaUploadForm = ({ onComplete, onCancel, bucketId = "profiles" }: MediaUploadFormProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  
  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files);
      
      // Filter for image files
      const imageFiles = filesArray.filter(file => file.type.startsWith("image/"));
      
      if (imageFiles.length !== filesArray.length) {
        toast({
          title: "Invalid file type",
          description: "Only image files are allowed.",
          variant: "destructive"
        });
      }
      
      setSelectedFiles(prev => [...prev, ...imageFiles]);
    }
  }, [toast]);
  
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const filesArray = Array.from(event.dataTransfer.files);
      
      // Filter for image files
      const imageFiles = filesArray.filter(file => file.type.startsWith("image/"));
      
      if (imageFiles.length !== filesArray.length) {
        toast({
          title: "Invalid file type",
          description: "Only image files are allowed.",
          variant: "destructive"
        });
      }
      
      setSelectedFiles(prev => [...prev, ...imageFiles]);
    }
  }, [toast]);
  
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);
  
  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  // Fallback method to use browser storage when Supabase bucket is not available
  const saveToLocalStorage = async (file: File, fileId: string) => {
    return new Promise<{ success: boolean; url: string; width?: number; height?: number }>((resolve) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (!e.target || !e.target.result) {
            resolve({ success: false, url: "" });
            return;
          }
          
          const dataUrl = e.target.result.toString();
          
          // Create an image element to get dimensions
          const img = new Image();
          img.onload = () => {
            const dimensions = {
              width: img.width,
              height: img.height
            };
            
            // Store the data URL in localStorage
            try {
              localStorage.setItem(`media_item_${fileId}`, dataUrl);
              resolve({ 
                success: true, 
                url: dataUrl,
                width: dimensions.width,
                height: dimensions.height 
              });
            } catch (error) {
              console.error("Failed to save to localStorage:", error);
              
              // If localStorage fails (quota exceeded), use an object URL as fallback
              const objectUrl = URL.createObjectURL(file);
              resolve({ 
                success: true, 
                url: objectUrl,
                width: dimensions.width,
                height: dimensions.height 
              });
            }
          };
          
          img.onerror = () => {
            resolve({ success: false, url: "" });
          };
          
          img.src = dataUrl;
        };
        
        reader.onerror = () => {
          resolve({ success: false, url: "" });
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error in saveToLocalStorage:", error);
        resolve({ success: false, url: "" });
      }
    });
  };
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const uploadedItems: MediaItem[] = [];
    let successCount = 0;
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileId = uuidv4();
        const fileExt = file.name.split('.').pop() || 'jpg';
        const filePath = `uploads/${fileId}.${fileExt}`;
        
        try {
          // Try to upload the file to Supabase storage first
          const result = await uploadOptimizedImage(
            file,
            filePath,
            bucketId,
            { 
              maxWidth: 1920,
              quality: 0.85,
              altText: file.name.split('.')[0] 
            }
          );
          
          if (result.success && result.data) {
            // Create a MediaItem from the uploaded file
            const mediaItem: MediaItem = {
              id: fileId,
              name: file.name,
              url: result.data.publicUrl,
              type: "image",
              size: file.size,
              uploadedAt: new Date().toISOString(),
              dimensions: {
                width: result.data.width,
                height: result.data.height
              }
            };
            
            uploadedItems.push(mediaItem);
            successCount++;
          } else {
            console.error("Supabase upload failed for file", file.name, result.error);
            
            // Fallback to local storage
            console.log("Trying localStorage fallback for file:", file.name);
            const localResult = await saveToLocalStorage(file, fileId);
            
            if (localResult.success) {
              // Create a MediaItem from the locally stored file
              const mediaItem: MediaItem = {
                id: fileId,
                name: file.name,
                url: localResult.url,
                type: "image",
                size: file.size,
                uploadedAt: new Date().toISOString(),
                dimensions: {
                  width: localResult.width,
                  height: localResult.height
                }
              };
              
              uploadedItems.push(mediaItem);
              successCount++;
            } else {
              console.error("Both Supabase and localStorage uploads failed for file:", file.name);
            }
          }
        } catch (error) {
          console.error("Error uploading file:", file.name, error);
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
      console.error("Upload error:", error);
      toast({
        title: "Upload Error",
        description: "An error occurred while uploading files.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          selectedFiles.length > 0 ? "border-gray-300" : "border-primary/50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {selectedFiles.length === 0 ? (
          <div className="space-y-2">
            <div className="flex justify-center">
              <Upload className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">
              Drag and drop files here, or click to select files
            </p>
            <Button
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={isUploading}
            >
              Select Files
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected Files ({selectedFiles.length})</p>
            <div className="max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded my-1"
                >
                  <div className="flex items-center">
                    <File className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={isUploading}
            >
              Add More Files
            </Button>
          </div>
        )}
      </div>
      
      {isUploading && (
        <div className="space-y-2">
          <div className="h-2 w-full bg-gray-200 rounded">
            <div 
              className="h-full bg-primary rounded" 
              style={{ width: `${uploadProgress}%` }} 
            />
          </div>
          <p className="text-sm text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
    </div>
  );
};

export default MediaUploadForm;
