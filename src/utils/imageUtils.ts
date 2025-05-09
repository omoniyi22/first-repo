
/**
 * Utility function to get the correct image path regardless of source
 * Handles:
 * - Full URLs (http/https)
 * - Supabase storage URLs
 * - Local paths with or without /lovable-uploads/ prefix
 * 
 * @param imagePath The original image path
 * @param fallbackImage Optional fallback image path if the original fails
 * @returns The processed image path
 */
export const getImagePath = (imagePath: string, fallbackImage: string = '/placeholder.svg'): string => {
  if (!imagePath) return fallbackImage;
  
  // Check if the image path is a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Check if the path already has /lovable-uploads/ prefix
  if (imagePath.includes('/lovable-uploads/')) {
    return imagePath;
  }
  
  // Add the /lovable-uploads/ prefix to local paths
  if (imagePath.startsWith('/')) {
    return `/lovable-uploads${imagePath}`;
  }
  
  // For any other case, assume it needs the prefix
  return `/lovable-uploads/${imagePath}`;
};

/**
 * Generic image error handler to use with onError event
 * @param e The error event
 * @param fallbackImage Optional fallback image path
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement>, 
  fallbackImage: string = '/placeholder.svg'
) => {
  const target = e.target as HTMLImageElement;
  console.log(`Failed to load image: ${target.src}`);
  target.src = fallbackImage;
  target.onerror = null; // Prevent infinite error loop
};
