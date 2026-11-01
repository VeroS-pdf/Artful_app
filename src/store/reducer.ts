import { DEFAULT_COLOR, type ColorKey } from '../colors';
import type { AppData, Folder, Note } from '../types';

export type Action =
  | { type: 'folder/add'; folder: Folder }
  | { type: 'folder/rename'; id: string; name: string }
  | { type: 'folder/recolor'; id: string; color: ColorKey }
  | { type: 'folder/delete'; id: string }
  | { type: 'note/add'; note: Note }
  | { type: 'note/edit'; id: string; text: string }
  | { type: 'note/move'; id: string; folderId: string }
  /** `now` and `restoreFolderId` are passed in so the reducer stays pure. */
  | { type: 'note/toggle'; id: string; now: number; restoreFolderId: string }
  | { type: 'note/delete'; id: string }
  | { type: 'note/addImages'; id: string; imageIds: string[] }
  | { type: 'note/removeImage'; id: string; imageId: string };

function updateNote(state: AppData, id: string, change: (note: Note) => Note): AppData {
  return { ...state, notes: state.notes.map((n) => (n.id === id ? change(n) : n)) };
}

export function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'folder/add':
      return { ...state, folders: [...state.folders, action.folder] };

    case 'folder/rename':
      return { ...state, folders: state.folders.map((f) => (f.id === action.id ? { ...f, name: action.name } : f)) };

    case 'folder/recolor':
      return { ...state, folders: state.folders.map((f) => (f.id === action.id ? { ...f, color: action.color } : f)) };

    case 'folder/delete': {
      const folder = state.folders.find((f) => f.id === action.id);
      if (!folder) return state;
      return {
        folders: state.folders.filter((f) => f.id !== action.id),
        // Open notes go with the folder; completed ones stay in the archive.
        notes: state.notes
          .filter((n) => n.folderId !== action.id || n.completed)
          .map((n) =>
            n.folderId === action.id ? { ...n, folderId: null, originName: folder.name, originColor: folder.color } : n,
          ),
      };
    }

    case 'note/add':
      return { ...state, notes: [...state.notes, action.note] };

    case 'note/edit':
      return updateNote(state, action.id, (n) => ({ ...n, text: action.text }));

    case 'note/move':
      return updateNote(state, action.id, (n) => ({ ...n, folderId: action.folderId }));

    case 'note/toggle': {
      const note = state.notes.find((n) => n.id === action.id);
      if (!note) return state;

      if (!note.completed) {
        return updateNote(state, action.id, (n) => ({ ...n, completed: true, completedAt: action.now }));
      }

      // Un-checking. If the note's folder was deleted, bring that folder back.
      let folders = state.folders;
      let folderId = note.folderId;
      if (folderId === null) {
        folderId = action.restoreFolderId;
        folders = [
          ...folders,
          { id: folderId, name: note.originName ?? 'Restored notes', color: note.originColor ?? DEFAULT_COLOR },
        ];
      }
      const restoredTo = folderId;
      return {
        folders,
        notes: state.notes.map((n) =>
          n.id === action.id
            ? { ...n, folderId: restoredTo, originName: undefined, originColor: undefined, completed: false, completedAt: null }
            : n,
        ),
      };
    }

    case 'note/delete':
      return { ...state, notes: state.notes.filter((n) => n.id !== action.id) };

    case 'note/addImages':
      return updateNote(state, action.id, (n) => ({ ...n, imageIds: [...n.imageIds, ...action.imageIds] }));

    case 'note/removeImage':
      return updateNote(state, action.id, (n) => ({ ...n, imageIds: n.imageIds.filter((i) => i !== action.imageId) }));
  }
}
