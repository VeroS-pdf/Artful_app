/**
 * Picture storage.
 *
 * Photos are far too big for localStorage, so each one is kept as a Blob in
 * IndexedDB and referenced from its note by id. They are only read back when
 * somebody clicks a note's image icon.
 */
import { uid } from '../uid';

const DB_NAME = 'artful-app';
const STORE = 'images';

/** Anything bigger than this is shrunk before it is stored. */
const MAX_BYTES = 1.5 * 1024 * 1024;
const MAX_EDGE = 2000;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });
  return dbPromise;
}

async function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = work(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(request.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function saveImage(blob: Blob): Promise<string> {
  const id = uid();
  await run('readwrite', (store) => store.put(blob, id));
  return id;
}

export function loadImage(id: string): Promise<Blob | undefined> {
  return run('readonly', (store) => store.get(id));
}

export async function deleteImages(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    ids.forEach((id) => store.delete(id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export interface PreparedImage {
  name: string;
  blob: Blob;
}

/** Prepares every picked file; the ones that aren't usable pictures are counted in `skipped`. */
export async function prepareImages(files: File[]): Promise<{ images: PreparedImage[]; skipped: number }> {
  const results = await Promise.allSettled(files.map(prepareImage));
  const images = results.flatMap((r, i) => (r.status === 'fulfilled' ? [{ name: files[i].name, blob: r.value }] : []));
  return { images, skipped: files.length - images.length };
}

export function skippedMessage(count: number): string {
  return count === 1
    ? '1 file was skipped because it isn’t a picture this browser can read.'
    : `${count} files were skipped because they aren’t pictures this browser can read.`;
}

/** Validates a picked file and shrinks it if it is large. Throws if it can't be used. */
async function prepareImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image`);
  if (file.size <= MAX_BYTES) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');
  // JPEG has no transparency, so paint white underneath first.
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  if (!blob) throw new Error(`Could not process ${file.name}`);
  return blob;
}
