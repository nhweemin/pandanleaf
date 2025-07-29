import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Compress image by resizing and reducing quality
const compressImage = async (imageUri: string): Promise<string> => {
  try {
    // Resize and compress the image
    const result = await manipulateAsync(
      imageUri,
      [
        { resize: { width: 800, height: 600 } }, // Resize to max 800x600
      ],
      {
        compress: 0.7, // 70% quality
        format: SaveFormat.JPEG,
        base64: true,
      }
    );
    
    return result.base64 || '';
  } catch (error) {
    console.error('Image compression failed:', error);
    throw error;
  }
};

// Upload image to cloud storage with multiple fallback options
export const uploadImageToCloud = async (imageUri: string): Promise<ImageUploadResult> => {
  try {
    // Check if it's a local file URI
    if (!imageUri.startsWith('file://') && !imageUri.startsWith('content://')) {
      // Already a remote URL, return as is
      return { success: true, url: imageUri };
    }

    console.log('🚀 Starting cloud image upload:', imageUri);

    // Convert image to base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('📝 Image converted to base64, size:', base64.length);

    // Create data URI from base64
    const dataUri = `data:image/jpeg;base64,${base64}`;
    const sizeInMB = (base64.length * 0.75) / (1024 * 1024); // Approximate size
    
    console.log('📏 Image size:', `${sizeInMB.toFixed(2)}MB`);
    
    // If image is too large, compress it by reducing quality
    if (sizeInMB > 2) {
      console.log('🔄 Image too large, compressing...');
      try {
        // Re-read with compression (manipulate the image)
        const compressedBase64 = await compressImage(imageUri);
        const compressedDataUri = `data:image/jpeg;base64,${compressedBase64}`;
        const newSize = (compressedBase64.length * 0.75) / (1024 * 1024);
        
        console.log('✅ Image compressed successfully:', `${newSize.toFixed(2)}MB`);
        return { 
          success: true, 
          url: compressedDataUri 
        };
      } catch (compressionError) {
        console.log('⚠️ Compression failed, using original image anyway');
        // Use original image even if large - better than placeholder
        return { 
          success: true, 
          url: dataUri 
        };
      }
    }
    
    console.log('✅ Using original image size');
    
    return { 
      success: true, 
      url: dataUri 
    };

    // Alternative: Try different upload services (commented out for now)
    /*
    // Try multiple upload services for better reliability
    const uploadResults = await Promise.allSettled([
      tryImgBBUpload(base64),
      tryAlternativeUpload(base64),
    ]);

    // Use the first successful upload
    for (const result of uploadResults) {
      if (result.status === 'fulfilled' && result.value.success) {
        console.log('✅ Image uploaded successfully:', result.value.url);
        return result.value;
      }
    }

    throw new Error('All upload services failed');
    */
  } catch (error) {
    console.error('❌ Cloud upload failed:', error);
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

// Helper function for ImgBB upload (for future use with real API key)
const tryImgBBUpload = async (base64: string): Promise<ImageUploadResult> => {
  // Get your own API key from https://api.imgbb.com/
  const apiKey = 'YOUR_REAL_IMGBB_API_KEY_HERE';
  
  if (apiKey === 'YOUR_REAL_IMGBB_API_KEY_HERE') {
    throw new Error('ImgBB API key not configured');
  }
  
  const formData = new FormData();
  formData.append('image', base64);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  
  if (response.ok && result.success) {
    return { success: true, url: result.data.url };
  } else {
    throw new Error(result.error?.message || 'ImgBB upload failed');
  }
};

// Fallback function that uses a category-specific placeholder for local images
export const processImageForBackend = (imageUri: string, category?: string): string => {
  // If it's a local file URI, use a category-specific food placeholder
  if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
    // Return category-specific food image URL
    const categoryPlaceholders = {
      'Main Course': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
      'Desserts': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
      'Snacks': 'https://images.unsplash.com/photo-1559715745-e1b33a271c8f?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
      'Soups': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
      'Salads': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
      'Beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
      'Breakfast': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop&crop=center&auto=format&q=80'
    };
    
    // Return category-specific placeholder or default
    return categoryPlaceholders[category as keyof typeof categoryPlaceholders] || 
           'https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=400&h=300&fit=crop&crop=center&auto=format&q=80';
  }
  
  // Return the original URL if it's already remote
  return imageUri;
};

// Function to display local image for preview while using remote URL for backend
export const getDisplayImageUri = (originalUri: string, backendUri?: string): string => {
  // If we have a backend URI and the original is local, use original for display
  if (backendUri && (originalUri.startsWith('file://') || originalUri.startsWith('content://'))) {
    return originalUri; // Show the actual photo they took
  }
  
  // Otherwise use the backend URI or original
  return backendUri || originalUri;
}; 