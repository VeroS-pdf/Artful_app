import type { ColorKey } from './colors';

export interface Folder {
  id: string;
  name: string;
  color: ColorKey;
}

export interface Note {
  id: string;
  /**
   * The folder the note lives in. Only a completed note can have `null` here:
   * deleting a folder removes its open notes, but finished ones stay in the
   * Completed archive (remembering where they came from in `originName`).
   */
  folderId: string | null;
  originName?: string;
  originColor?: ColorKey;
  text: string;
  /** Keys into the IndexedDB image store; the pictures themselves are loaded on demand. */
  imageIds: string[];
  completed: boolean;
  createdAt: number;
  completedAt: number | null;
}

export interface AppData {
  folders: Folder[];
  notes: Note[];
}
