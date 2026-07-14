import { storageService } from '../services/StorageService';

export const DEFAULT_AVATAR = '/default_ava.jpg';
export const DEFAULT_COVER = '/default_cover.jpg';

const imageCache = new Map();
const pendingRequests = new Map();

export function getCachedImageSync(path) {
  if (!path) return null;
  return imageCache.get(path) || null;
}

export async function getCachedImage(path) {
  if(!path) return null

  if (imageCache.has(path)) return imageCache.get(path);
  if (pendingRequests.has(path)) return pendingRequests.get(path);

  const promise = (async () => {
    try {
      const blob = await storageService.getFile(path);
      const blobUrl = URL.createObjectURL(blob);
      imageCache.set(path, blobUrl);
      return blobUrl;
    } catch (err) {
      return null;
    } finally {
      pendingRequests.delete(path);
    }
  })();

  pendingRequests.set(path, promise);
  return promise;
}

export async function getCachedStaticImage(url) {
  if (!url) return null;

  if (imageCache.has(url)) return imageCache.get(url);
  if (pendingRequests.has(url)) return pendingRequests.get(url);

  const promise = (async () => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      imageCache.set(url, blobUrl);
      return blobUrl;
    } catch (err) {
      return url;
    } finally {
      pendingRequests.delete(url);
    }
  })();

  pendingRequests.set(url, promise);
  return promise;
}

export function invalidateImageCache(path) {
  if (imageCache.has(path)) {
    const oldUrl = imageCache.get(path);
    URL.revokeObjectURL(oldUrl);
    imageCache.delete(path);
  }
}