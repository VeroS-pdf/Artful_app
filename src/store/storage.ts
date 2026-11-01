import { DEFAULT_COLOR, isColorKey } from '../colors';
import type { AppData, Folder, Note } from '../types';
import { uid } from '../uid';

const STORAGE_KEY = 'artful-app:v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readFolder(value: unknown): Folder | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string') return null;
  return { id: value.id, name: value.name, color: isColorKey(value.color) ? value.color : DEFAULT_COLOR };
}

function readNote(value: unknown): Note | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.text !== 'string') return null;
  const completed = value.completed === true;
  return {
    id: value.id,
    folderId: typeof value.folderId === 'string' ? value.folderId : null,
    originName: typeof value.originName === 'string' ? value.originName : undefined,
    originColor: isColorKey(value.originColor) ? value.originColor : undefined,
    text: value.text,
    imageIds: Array.isArray(value.imageIds) ? value.imageIds.filter((i): i is string => typeof i === 'string') : [],
    completed,
    createdAt: typeof value.createdAt === 'number' ? value.createdAt : Date.now(),
    completedAt: completed ? (typeof value.completedAt === 'number' ? value.completedAt : Date.now()) : null,
  };
}

/** A brand-new install starts with one teal folder so there is somewhere to drop the first idea. */
function seed(): AppData {
  return { folders: [{ id: uid(), name: 'Ideas', color: DEFAULT_COLOR }], notes: [] };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isRecord(parsed) && Array.isArray(parsed.folders) && Array.isArray(parsed.notes)) {
        return {
          folders: parsed.folders.map(readFolder).filter((f): f is Folder => f !== null),
          notes: parsed.notes.map(readNote).filter((n): n is Note => n !== null),
        };
      }
    }
  } catch {
    // Unreadable or blocked storage: fall through to a fresh start.
  }
  return seed();
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage may be full or disabled; the app keeps working for this session.
  }
}
