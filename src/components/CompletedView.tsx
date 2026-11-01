import { useMemo } from 'react';
import { useStore } from '../store/StoreProvider';
import { CheckCircleIcon } from './Icons';
import { NoteRow } from './NoteRow';

interface CompletedViewProps {
  onOpenNote: (noteId: string) => void;
  onViewImages: (noteId: string) => void;
}

/** The archive: every completed note, whichever folder it started in. */
export function CompletedView({ onOpenNote, onViewImages }: CompletedViewProps) {
  const { notes } = useStore();
  const done = useMemo(
    () => notes.filter((n) => n.completed).sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)),
    [notes],
  );

  return (
    <section className="panel">
      <header className="folder-head">
        <span className="swatch-btn swatch-btn--static" aria-hidden="true">
          <CheckCircleIcon />
        </span>
        <h1 className="folder-title folder-title--static">Completed</h1>
      </header>
      <p className="folder-meta">
        {done.length} finished {done.length === 1 ? 'note' : 'notes'}, from every folder
      </p>

      {done.length > 0 ? (
        <ul className="note-list">
          {done.map((n) => (
            <NoteRow key={n.id} note={n} showFolder onOpen={onOpenNote} onViewImages={onViewImages} />
          ))}
        </ul>
      ) : (
        <p className="empty">Notes you check off will be archived here.</p>
      )}
    </section>
  );
}
