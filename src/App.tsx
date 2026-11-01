import { useEffect, useState } from 'react';
import { colorVars } from './colors';
import { CompletedView } from './components/CompletedView';
import { FolderView } from './components/FolderView';
import { ImageViewer } from './components/ImageViewer';
import { Landing } from './components/Landing';
import { NoteDetail } from './components/NoteDetail';
import { Sidebar } from './components/Sidebar';
import { StoreProvider, useStore } from './store/StoreProvider';
import type { Folder } from './types';
import type { View } from './view';

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

interface Toast {
  id: number;
  folder: Folder;
}

function Shell() {
  const { folders } = useStore();
  const [requestedView, setView] = useState<View>({ kind: 'landing' });
  const [landingFolderId, setLandingFolderId] = useState<string | null>(null);
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [imageNoteId, setImageNoteId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  // The app always opens on the landing page. If the folder being viewed is deleted, go back there too.
  const folder = requestedView.kind === 'folder' ? folders.find((f) => f.id === requestedView.id) : undefined;
  const view: View = requestedView.kind === 'folder' && !folder ? { kind: 'landing' } : requestedView;

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="shell">
      <Sidebar view={view} onNavigate={setView} />

      <main className="main">
        {view.kind === 'landing' && (
          <Landing
            selectedFolderId={landingFolderId}
            onSelectFolder={setLandingFolderId}
            onSaved={(f) => setToast({ id: Date.now(), folder: f })}
          />
        )}
        {view.kind === 'folder' && folder && (
          <FolderView key={folder.id} folder={folder} onOpenNote={setOpenNoteId} onViewImages={setImageNoteId} />
        )}
        {view.kind === 'completed' && <CompletedView onOpenNote={setOpenNoteId} onViewImages={setImageNoteId} />}
      </main>

      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div key={toast.id} className="toast" style={colorVars(toast.folder.color)}>
            Saved to <strong>{toast.folder.name}</strong>
            <button
              type="button"
              onClick={() => {
                setView({ kind: 'folder', id: toast.folder.id });
                setToast(null);
              }}
            >
              View folder
            </button>
          </div>
        )}
      </div>

      {openNoteId && <NoteDetail noteId={openNoteId} onClose={() => setOpenNoteId(null)} />}
      {imageNoteId && <ImageViewer noteId={imageNoteId} onClose={() => setImageNoteId(null)} />}
    </div>
  );
}
