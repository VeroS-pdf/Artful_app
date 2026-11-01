import { useEffect, useState } from 'react';
import { loadImage } from '../store/images';
import { CloseIcon } from './Icons';

/**
 * Loads the pictures for the given ids from IndexedDB as object URLs.
 * An empty string means the picture could not be found.
 */
function useImageUrls(ids: string[]): Record<string, string> {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const key = ids.join(',');

  useEffect(() => {
    let cancelled = false;
    const made: string[] = [];

    Promise.all(
      (key ? key.split(',') : []).map(async (id): Promise<[string, string]> => {
        const blob = await loadImage(id).catch(() => undefined);
        if (!blob) return [id, ''];
        const url = URL.createObjectURL(blob);
        made.push(url);
        return [id, url];
      }),
    ).then((entries) => {
      if (!cancelled) setUrls(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
      made.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [key]);

  return urls;
}

interface ImageGalleryProps {
  ids: string[];
  /** When given, each picture gets a remove button. */
  onRemove?: (id: string) => void;
}

export function ImageGallery({ ids, onRemove }: ImageGalleryProps) {
  const urls = useImageUrls(ids);

  return (
    <ul className="gallery">
      {ids.map((id, i) => (
        <li key={id} className="gallery-item">
          {urls[id] ? (
            <img src={urls[id]} alt={`Attached picture ${i + 1}`} />
          ) : (
            <div className="gallery-empty">{id in urls ? 'Picture unavailable' : 'Loading…'}</div>
          )}
          {onRemove && (
            <button
              type="button"
              className="gallery-remove"
              aria-label={`Remove picture ${i + 1}`}
              onClick={() => onRemove(id)}
            >
              <CloseIcon />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
