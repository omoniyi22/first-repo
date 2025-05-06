
import { Cloudinary } from "@cloudinary/url-gen";

// Cloudinary configuration
// Note: These should be your Cloudinary credentials
const cloudName = "demo";  // Replace with your actual cloud name
const apiKey = "123456789012345";  // Replace with your actual API key
const apiSecret = "abcdefghijklmnopqrstuvwxyz";  // Replace with your actual API secret

// Initialize Cloudinary instance
export const cloudinary = new Cloudinary({
  cloud: {
    cloudName,
  },
});

// Base URL for unsigned uploads to Cloudinary
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
const UPLOAD_PRESET = "ml_default";  // Change to your upload preset if you have one

/**
 * Uploads an image to Cloudinary
 */
export const uploadToCloudinary = async (file: File): Promise<{
  success: boolean;
  url?: string;
  publicId?: string;
  width?: number;
  height?: number;
  error?: string;
}> => {
  try {
    // Create form data for upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    
    // If you want to use a specific folder
    formData.append("folder", "blog-images");
    
    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary upload failed:", errorData);
      return { 
        success: false,
        error: errorData.error?.message || "Failed to upload to Cloudinary"
      };
    }
    
    const data = await response.json();
    console.log("Cloudinary upload successful:", data);
    
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

/**
 * Generates a Cloudinary URL for an image
 */
export const getCloudinaryUrl = (publicId: string, options = {}) => {
  return cloudinary.image(publicId).toURL();
};
