import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_IMAGES_KEY = 'chef_local_images';

export interface LocalImageMapping {
  [productId: string]: string; // productId -> local image URI
}

/**
 * Store a local image URI for a specific product ID
 */
export const storeLocalImage = async (productId: string, imageUri: string): Promise<void> => {
  try {
    // Only store if it's a local image URI
    if (!imageUri.startsWith('file://') && !imageUri.startsWith('content://')) {
      return;
    }

    const existing = await getLocalImages();
    const updated = {
      ...existing,
      [productId]: imageUri
    };

    await AsyncStorage.setItem(LOCAL_IMAGES_KEY, JSON.stringify(updated));
    console.log(`Stored local image for product ${productId}:`, imageUri);
  } catch (error) {
    console.error('Error storing local image:', error);
  }
};

/**
 * Get the local image URI for a specific product ID
 */
export const getLocalImage = async (productId: string): Promise<string | null> => {
  try {
    const images = await getLocalImages();
    return images[productId] || null;
  } catch (error) {
    console.error('Error getting local image:', error);
    return null;
  }
};

/**
 * Get all local image mappings
 */
export const getLocalImages = async (): Promise<LocalImageMapping> => {
  try {
    const stored = await AsyncStorage.getItem(LOCAL_IMAGES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error getting local images:', error);
    return {};
  }
};

/**
 * Remove a local image mapping for a specific product
 */
export const removeLocalImage = async (productId: string): Promise<void> => {
  try {
    const existing = await getLocalImages();
    delete existing[productId];
    await AsyncStorage.setItem(LOCAL_IMAGES_KEY, JSON.stringify(existing));
    console.log(`Removed local image for product ${productId}`);
  } catch (error) {
    console.error('Error removing local image:', error);
  }
};

/**
 * Get the display image for a product - prioritizes local images for chefs
 */
export const getDisplayImageForChef = async (productId: string, backendImageUri: string): Promise<string> => {
  const localImage = await getLocalImage(productId);
  return localImage || backendImageUri;
};

/**
 * Clean up old local images that no longer exist as files
 */
export const cleanupLocalImages = async (): Promise<void> => {
  try {
    const images = await getLocalImages();
    const validImages: LocalImageMapping = {};

    // For now, just keep all images - in a real app you'd check file existence
    // This is a placeholder for future cleanup logic
    for (const [productId, imageUri] of Object.entries(images)) {
      validImages[productId] = imageUri;
    }

    await AsyncStorage.setItem(LOCAL_IMAGES_KEY, JSON.stringify(validImages));
  } catch (error) {
    console.error('Error cleaning up local images:', error);
  }
}; 