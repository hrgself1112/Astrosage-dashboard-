import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { storage } from '../firebase';

// For client-side background removal, we'll use a browser-based solution
// This implementation uses the browser's Canvas API with a simple edge detection
// In a production environment, you'd want to set up a proper backend service

class BackgroundRemovalService {
  private static instance: BackgroundRemovalService;

  static getInstance(): BackgroundRemovalService {
    if (!BackgroundRemovalService.instance) {
      BackgroundRemovalService.instance = new BackgroundRemovalService();
    }
    return BackgroundRemovalService.instance;
  }

  async uploadToStorage(file: File): Promise<string> {
    const storageRef = ref(storage, `background-removal/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  }

  async processImageBackgroundRemoval(
    imageUrl: string,
    model: 'rembg' | 'u2net' = 'rembg',
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Could not get canvas context');
          }

          // Set canvas size
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Simulate progress
          if (onProgress) {
            onProgress(25);
          }

          // Simple background removal using color detection
          // This is a basic implementation - in production you'd use a proper ML model
          const processedData = this.removeBackgroundSimple(data, canvas.width, canvas.height);

          if (onProgress) {
            onProgress(75);
          }

          // Put processed data back
          const processedImageData = new ImageData(processedData, canvas.width, canvas.height);
          ctx.putImageData(processedImageData, 0, 0);

          if (onProgress) {
            onProgress(100);
          }

          // Convert to blob and return URL
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/png');

        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = imageUrl;
    });
  }

  private removeBackgroundSimple(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const processed = new Uint8ClampedArray(data.length);

    // Simple background removal based on edge detection
    // This is a placeholder - in production you'd use rembg or similar
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Simple background detection (corners and light colors)
      const isLightColor = (r + g + b) / 3 > 200;
      const isCorner = this.isPixelNearCorner(i / 4, width, height);

      if (isLightColor && isCorner) {
        // Make transparent
        processed[i] = r;
        processed[i + 1] = g;
        processed[i + 2] = b;
        processed[i + 3] = 0;
      } else {
        // Keep original
        processed[i] = r;
        processed[i + 1] = g;
        processed[i + 2] = b;
        processed[i + 3] = a;
      }
    }

    return processed;
  }

  private isPixelNearCorner(index: number, width: number, height: number): boolean {
    const x = index % width;
    const y = Math.floor(index / width);
    const threshold = Math.min(width, height) * 0.1; // 10% of dimension

    return (
      (x < threshold && y < threshold) || // Top-left
      (x > width - threshold && y < threshold) || // Top-right
      (x < threshold && y > height - threshold) || // Bottom-left
      (x > width - threshold && y > height - threshold) // Bottom-right
    );
  }

  // Advanced background removal using canvas manipulation
  async processImageAdvanced(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Could not get canvas context');
          }

          canvas.width = img.width;
          canvas.height = img.height;

          // Draw image
          ctx.drawImage(img, 0, 0);

          // Apply edge detection filter
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const edges = this.detectEdges(imageData);
          const mask = this.createMask(edges, canvas.width, canvas.height);

          // Apply mask to create transparent background
          const masked = this.applyMask(imageData, mask);
          ctx.putImageData(masked, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/png');

        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = imageUrl;
    });
  }

  private detectEdges(imageData: ImageData): Uint8ClampedArray {
    const { data, width, height } = imageData;
    const edges = new Uint8ClampedArray(data.length);

    // Simple Sobel edge detection
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        // Calculate gradients
        const topLeft = ((y - 1) * width + (x - 1)) * 4;
        const top = ((y - 1) * width + x) * 4;
        const topRight = ((y - 1) * width + (x + 1)) * 4;
        const left = (y * width + (x - 1)) * 4;
        const right = (y * width + (x + 1)) * 4;
        const bottomLeft = ((y + 1) * width + (x - 1)) * 4;
        const bottom = ((y + 1) * width + x) * 4;
        const bottomRight = ((y + 1) * width + (x + 1)) * 4;

        // Convert to grayscale
        const getGray = (offset: number) => {
          return (data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114);
        };

        const gx =
          -1 * getGray(topLeft) + 1 * getGray(topRight) +
          -2 * getGray(left) + 2 * getGray(right) +
          -1 * getGray(bottomLeft) + 1 * getGray(bottomRight);

        const gy =
          -1 * getGray(topLeft) - 2 * getGray(top) - 1 * getGray(topRight) +
          1 * getGray(bottomLeft) + 2 * getGray(bottom) + 1 * getGray(bottomRight);

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const edge = magnitude > 30 ? 255 : 0;

        edges[idx] = edge;
        edges[idx + 1] = edge;
        edges[idx + 2] = edge;
        edges[idx + 3] = 255;
      }
    }

    return edges;
  }

  private createMask(edges: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const mask = new Uint8ClampedArray(edges.length);

    // Flood fill from edges to create mask
    for (let i = 0; i < edges.length; i += 4) {
      const isEdge = edges[i] > 128;

      if (isEdge) {
        mask[i] = 255; // Keep edge
        mask[i + 1] = 255;
        mask[i + 2] = 255;
        mask[i + 3] = 255;
      } else {
        mask[i] = 0; // Remove non-edge
        mask[i + 1] = 0;
        mask[i + 2] = 0;
        mask[i + 3] = 0;
      }
    }

    return mask;
  }

  private applyMask(imageData: ImageData, mask: Uint8ClampedArray): ImageData {
    const { data } = imageData;
    const result = new ImageData(data.length, imageData.width, imageData.height);

    for (let i = 0; i < data.length; i += 4) {
      if (mask[i + 3] > 128) {
        // Keep pixels that are marked in mask
        result.data[i] = data[i];
        result.data[i + 1] = data[i + 1];
        result.data[i + 2] = data[i + 2];
        result.data[i + 3] = data[i + 3];
      } else {
        // Make others transparent
        result.data[i] = data[i];
        result.data[i + 1] = data[i + 1];
        result.data[i + 2] = data[i + 2];
        result.data[i + 3] = 0;
      }
    }

    return result;
  }
}

// Export singleton instance
export const uploadToStorage = (file: File) => {
  return BackgroundRemovalService.getInstance().uploadToStorage(file);
};

export const processImageBackgroundRemoval = (
  imageUrl: string,
  model: 'rembg' | 'u2net' = 'rembg',
  onProgress?: (progress: number) => void
) => {
  return BackgroundRemovalService.getInstance().processImageBackgroundRemoval(imageUrl, model, onProgress);
};

export default BackgroundRemovalService;