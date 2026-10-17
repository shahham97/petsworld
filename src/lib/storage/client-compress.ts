/**
 * Client-side canvas image compression to ensure uploads remain well under Vercel's 4.5 MB limit.
 * Resizes image so its longest dimension is at most 2000 px, and compresses to JPEG/WebP.
 */
export async function compressImageOnClient(
  file: File,
  maxDimension = 2000,
  quality = 0.85
): Promise<Blob> {
  // If file is already tiny (< 250 KB), no heavy compression needed
  if (file.size < 250 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image in browser canvas."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file); // fallback to original file
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP or JPEG with controlled quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          "image/webp",
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
