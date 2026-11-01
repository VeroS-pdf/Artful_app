import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import type { ColorKey } from '../colors';
import type { Folder, Note } from '../types';
import { uid } from '../uid';
import { deleteImages, saveImage } from './images';
import { reducer } from './reducer';
import { loadData, saveData } from './storage';

interface Actions {
  /** Returns the new folder's id. */
  addFolder(name: string, color: ColorKey): string;
  renameFolder(id: string, name: string): void;
  recolorFolder(id: string, color: ColorKey): void;
  deleteFolder(id: string): void;
  addNote(folderId: string, text: string, images: Blob[]): Promise<void>;
  editNote(id: string, text: string): void;
  moveNote(id: string, folderId: string): void;
  toggleNote(id: string): void;
  deleteNote(id: string): void;
  attachImages(id: string, images: Blob[]): Promise<void>;
  removeImage(id: string, imageId: string): void;
}

interface Store extends Actions {
  folders: Folder[];
  notes: Note[];
}

const StoreContext = createContext<Store | null>(null);

const cleanName = (name: string) => name.trim() || 'Untitled folder';

/** Image cleanup is best-effort: a leftover blob is invisible, so failures are ignored. */
const discardImages = (ids: string[]) => void deleteImages(ids).catch(() => {});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadData);

  // Actions with side effects (image cleanup) need the latest state without being re-created.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => saveData(state), [state]);

  const actions = useMemo<Actions>(
    () => ({
      addFolder(name, color) {
        const id = uid();
        dispatch({ type: 'folder/add', folder: { id, name: cleanName(name), color } });
        return id;
      },
      renameFolder: (id, name) => dispatch({ type: 'folder/rename', id, name: cleanName(name) }),
      recolorFolder: (id, color) => dispatch({ type: 'folder/recolor', id, color }),
      deleteFolder(id) {
        const doomed = stateRef.current.notes
          .filter((n) => n.folderId === id && !n.completed)
          .flatMap((n) => n.imageIds);
        dispatch({ type: 'folder/delete', id });
        discardImages(doomed);
      },
      async addNote(folderId, text, images) {
        const imageIds = await Promise.all(images.map(saveImage));
        const note: Note = {
          id: uid(),
          folderId,
          text: text.trim(),
          imageIds,
          completed: false,
          createdAt: Date.now(),
          completedAt: null,
        };
        dispatch({ type: 'note/add', note });
      },
      editNote: (id, text) => dispatch({ type: 'note/edit', id, text }),
      moveNote: (id, folderId) => dispatch({ type: 'note/move', id, folderId }),
      toggleNote: (id) => dispatch({ type: 'note/toggle', id, now: Date.now(), restoreFolderId: uid() }),
      deleteNote(id) {
        const note = stateRef.current.notes.find((n) => n.id === id);
        dispatch({ type: 'note/delete', id });
        if (note) discardImages(note.imageIds);
      },
      async attachImages(id, images) {
        const imageIds = await Promise.all(images.map(saveImage));
        dispatch({ type: 'note/addImages', id, imageIds });
      },
      removeImage(id, imageId) {
        dispatch({ type: 'note/removeImage', id, imageId });
        discardImages([imageId]);
      },
    }),
    [],
  );

  const value = useMemo<Store>(() => ({ folders: state.folders, notes: state.notes, ...actions }), [state, actions]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <StoreProvider>');
  return store;
}
