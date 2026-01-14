/**
 * Handles image paths to ensure proper display of images from various sources
 * @param url The image URL or path
 * @returns A properly formatted image path
 */
export const getImagePath = (url: string | undefined): string => {
  if (!url) {
    return '/placeholder.svg';
  }
  
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative URL starting with /
  if (url.startsWith('/')) {
    return url;
  }
  
  // Otherwise, assume it's a path relative to public
  return `/${url}`;
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
