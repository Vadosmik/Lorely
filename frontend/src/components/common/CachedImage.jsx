import { useState, useEffect } from 'preact/hooks';
import { getCachedImage, getCachedImageSync, getCachedStaticImage } from '../../utils/imageCache';

export default function CachedImage({ path, previewUrl, fallback = '/default.jpg', alt, style }) {
  const [src, setSrc] = useState(() => {
    if (previewUrl) return previewUrl;
    if (!path) return getCachedImageSync(fallback) || fallback;
    return getCachedImageSync(path) || getCachedImageSync(fallback) || fallback;
  });

  useEffect(() => {
    if (previewUrl) {
      setSrc(previewUrl);
      return;
    }

    let isMounted = true;

    async function resolve() {
      if (path) {
        const cached = getCachedImageSync(path);
        if (cached) return setSrc(cached);

        const url = await getCachedImage(path);
        if (!isMounted) return;
        if (url) return setSrc(url);
      }

      const cachedFallback = getCachedImageSync(fallback);
      if (cachedFallback) return setSrc(cachedFallback);

      const fallbackUrl = await getCachedStaticImage(fallback);
      if (isMounted) setSrc(fallbackUrl);
    }
    
    resolve();
    return () => { isMounted = false; };
  }, [path, previewUrl, fallback]);

  return <img src={src} alt={alt} style={style} />;
}