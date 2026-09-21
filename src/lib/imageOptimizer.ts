/**
 * Client-Side Image Optimization Utility for VELORA
 * Compresses images before upload, scales long edge, creates thumbnail,
 * outputs high quality WebP with sensible perceptual quality.
 */

export interface OptimizedImageResult {
  mainBlob: Blob;
  thumbnailBlob: Blob;
  width: number;
  height: number;
  format: 'image/webp' | 'image/png' | 'image/jpeg';
}

export async function optimizeImageClientSide(
  file: File,
  maxMainDimension = 1600,
  maxThumbDimension = 600
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.onload = async () => {
        try {
          const originalWidth = img.naturalWidth || img.width;
          const originalHeight = img.naturalHeight || img.height;

          // Main image dimensions (never upscale)
          let mainWidth = originalWidth;
          let mainHeight = originalHeight;

          if (Math.max(mainWidth, mainHeight) > maxMainDimension) {
            if (mainWidth > mainHeight) {
              mainHeight = Math.round((mainHeight * maxMainDimension) / mainWidth);
              mainWidth = maxMainDimension;
            } else {
              mainWidth = Math.round((mainWidth * maxMainDimension) / mainHeight);
              mainHeight = maxMainDimension;
            }
          }

          // Thumbnail dimensions
          let thumbWidth = originalWidth;
          let thumbHeight = originalHeight;
          if (Math.max(thumbWidth, thumbHeight) > maxThumbDimension) {
            if (thumbWidth > thumbHeight) {
              thumbHeight = Math.round((thumbHeight * maxThumbDimension) / thumbWidth);
              thumbWidth = maxThumbDimension;
            } else {
              thumbWidth = Math.round((thumbWidth * maxThumbDimension) / thumbHeight);
              thumbHeight = maxThumbDimension;
            }
          }

          // Main canvas
          const mainCanvas = document.createElement('canvas');
          mainCanvas.width = mainWidth;
          mainCanvas.height = mainHeight;
          const mainCtx = mainCanvas.getContext('2d');
          if (!mainCtx) throw new Error('Could not create canvas context');

          mainCtx.imageSmoothingEnabled = true;
          mainCtx.imageSmoothingQuality = 'high';
          mainCtx.drawImage(img, 0, 0, mainWidth, mainHeight);

          // Thumbnail canvas
          const thumbCanvas = document.createElement('canvas');
          thumbCanvas.width = thumbWidth;
          thumbCanvas.height = thumbHeight;
          const thumbCtx = thumbCanvas.getContext('2d');
          if (!thumbCtx) throw new Error('Could not create thumbnail context');

          thumbCtx.imageSmoothingEnabled = true;
          thumbCtx.imageSmoothingQuality = 'high';
          thumbCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight);

          // Determine preferred format: WebP is preferred, PNG for transparent graphics
          const isPng = file.type === 'image/png';
          const targetFormat = 'image/webp';

          // Canvas toBlob promise helper
          const canvasToBlob = (
            canvas: HTMLCanvasElement,
            type: string,
            quality: number
          ): Promise<Blob> => {
            return new Promise((res, rej) => {
              canvas.toBlob(
                (blob) => {
                  if (blob) res(blob);
                  else rej(new Error('Canvas export failed'));
                },
                type,
                quality
              );
            });
          };

          // Try WebP first (fallback to original mime if browser does not support)
          let mainBlob: Blob;
          let thumbBlob: Blob;

          try {
            mainBlob = await canvasToBlob(mainCanvas, targetFormat, 0.85);
            thumbBlob = await canvasToBlob(thumbCanvas, targetFormat, 0.80);
          } catch {
            mainBlob = await canvasToBlob(mainCanvas, isPng ? 'image/png' : 'image/jpeg', 0.85);
            thumbBlob = await canvasToBlob(thumbCanvas, isPng ? 'image/png' : 'image/jpeg', 0.80);
          }

          resolve({
            mainBlob,
            thumbnailBlob: thumbBlob,
            width: mainWidth,
            height: mainHeight,
            format: (mainBlob.type as 'image/webp' | 'image/png' | 'image/jpeg') || 'image/webp',
          });
        } catch (err) {
          reject(err);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function optimizeImageFile(
  file: File,
  maxMainDimension = 1600,
  maxThumbDimension = 600
): Promise<{
  dataUrl: string;
  thumbnailDataUrl: string;
  optimizedSize: number;
  width: number;
  height: number;
  format: string;
}> {
  const result = await optimizeImageClientSide(file, maxMainDimension, maxThumbDimension);
  const dataUrl = await blobToDataUrl(result.mainBlob);
  const thumbnailDataUrl = await blobToDataUrl(result.thumbnailBlob);
  return {
    dataUrl,
    thumbnailDataUrl,
    optimizedSize: result.mainBlob.size,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}
