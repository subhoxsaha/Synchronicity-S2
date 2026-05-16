/**
 * Cloudinary Image Upload Service
 * 
 * Handles all image uploads via Cloudinary's unsigned upload API.
 * No backend needed — uploads go directly from browser to Cloudinary CDN.
 * 
 * Setup: Create an "unsigned" upload preset in Cloudinary Dashboard → Settings → Upload
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.warn('[Cloudinary] VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET missing in .env — image uploads will fail.');
}

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  thumbnailUrl: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ── Validation ──

export function validateImageFile(file: File, maxSizeMB: number = 5): ValidationResult {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: `Invalid format: ${file.type.split('/')[1]?.toUpperCase() || 'unknown'}. Use JPG, PNG, WebP, or GIF.` };
  }
  
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return { valid: false, error: `File too large (${sizeMB.toFixed(1)}MB). Max ${maxSizeMB}MB.` };
  }
  
  return { valid: true };
}

// ── Core Upload ──

export async function uploadImage(
  file: File,
  folder: string,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `campus-pulse/${folder}`);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.url,
          secureUrl: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
          format: data.format,
          bytes: data.bytes,
          thumbnailUrl: getOptimizedUrl(data.secure_url, 200),
        });
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData?.error?.message || `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload. Check your connection.'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled.'));
    });

    xhr.open('POST', UPLOAD_URL);
    xhr.send(formData);
  });
}

// ── Convenience Wrappers ──

/** Upload a user's profile picture (avatars). Max 2MB. */
export async function uploadProfilePicture(
  file: File,
  userId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const validation = validateImageFile(file, 2);
  if (!validation.valid) throw new Error(validation.error);
  
  const result = await uploadImage(file, `users/${userId}/avatar`, onProgress);
  // Return the circular-cropped version for immediate use
  return getAvatarUrl(result.secureUrl);
}

/** Upload an event banner. Max 5MB. */
export async function uploadEventBanner(
  file: File,
  eventId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const validation = validateImageFile(file, 5);
  if (!validation.valid) throw new Error(validation.error);
  
  const result = await uploadImage(file, `events/${eventId}`, onProgress);
  return result.secureUrl;
}

/** Upload an event/org logo. Max 2MB. */
export async function uploadEventLogo(
  file: File,
  eventId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const validation = validateImageFile(file, 2);
  if (!validation.valid) throw new Error(validation.error);
  
  const result = await uploadImage(file, `events/${eventId}/logo`, onProgress);
  return result.secureUrl;
}

/** Upload an event gallery image. Max 5MB. */
export async function uploadGalleryImage(
  file: File,
  eventId: string,
  index: number,
  onProgress?: (percent: number) => void
): Promise<string> {
  const validation = validateImageFile(file, 5);
  if (!validation.valid) throw new Error(validation.error);
  
  const result = await uploadImage(file, `events/${eventId}/gallery`, onProgress);
  return result.secureUrl;
}

/** Upload an organization logo. Max 2MB. Uses orgId for folder structure. */
export async function uploadOrgLogo(
  file: File,
  orgId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const validation = validateImageFile(file, 2);
  if (!validation.valid) throw new Error(validation.error);
  
  const result = await uploadImage(file, `organizations/${orgId}/logo`, onProgress);
  return result.secureUrl;
}

/** Upload a post/announcement image. Max 5MB. */
export async function uploadPostImage(
  file: File,
  postType: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const validation = validateImageFile(file, 5);
  if (!validation.valid) throw new Error(validation.error);
  
  const result = await uploadImage(file, `posts/${postType}`, onProgress);
  return result.secureUrl;
}

// ── URL Transforms (no re-upload needed) ──

/**
 * Get an optimized/resized version of a Cloudinary URL.
 * Works by inserting transform params into the URL path.
 * For non-Cloudinary URLs, returns the original.
 */
export function getOptimizedUrl(url: string, width?: number, height?: number): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  
  const transforms: string[] = ['f_auto', 'q_auto'];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  transforms.push('c_limit'); // Don't upscale, just limit size
  
  // Insert transforms after /upload/
  return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
}

/**
 * Get a thumbnail version (200x200 cropped)
 */
export function getThumbnailUrl(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/c_fill,w_200,h_200,f_auto,q_auto/');
}

/**
 * Get a circular avatar URL (face-aware crop, 256x256)
 */
export function getAvatarUrl(url: string, size: number = 256): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/c_thumb,g_face,w_${size},h_${size},r_max,f_auto,q_auto/`);
}

/**
 * Get a banner-optimized URL (1200w, limited height)
 */
export function getBannerUrl(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/c_fill,w_1200,h_400,f_auto,q_auto/');
}

/**
 * Get a blurred placeholder for lazy loading
 */
export function getBlurPlaceholder(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/w_40,h_40,f_auto,q_10,e_blur:400/');
}
