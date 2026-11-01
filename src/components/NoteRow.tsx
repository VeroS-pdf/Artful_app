import { DEFAULT_COLOR, colorVars } from '../colors';
import { useStore } from '../store/StoreProvider';
import type { Note } from '../types';
import { ImageIcon } from './Icons';

interface NoteRowProps {
  note: Note;
  /** Show which folder the note came from (used in the Completed archive). */
  showFolder?: boolean;
  onOpen: (noteId: string) => void;
  onViewImages: (noteId: string) => void;
}

/** One line of a list, Reminders-style: a check circle, up to three lines of text, an optional image icon. */
export function NoteRow({ note, showFolder = false, onOpen, onViewImages }: NoteRowProps) {
  const { folders, toggleNote } = useStore();
  const folder = folders.find((f) => f.id === note.folderId);
  const color = folder?.color ?? note.originColor ?? DEFAULT_COLOR;
  const folderName = folder?.name ?? note.originName ?? 'Deleted folder';
  const imageCount = note.imageIds.length;
  const preview = note.text.trim() || (imageCount > 0 ? 'Picture note' : 'Empty note');

  return (
    <li className={`note-row${note.completed ? ' is-done' : ''}`} style={colorVars(color)}>
      <input
        type="checkbox"
        className="check"
        checked={note.completed}
        onChange={() => toggleNote(note.id)}
        aria-label={note.completed ? 'Mark as not completed' : 'Mark as completed'}
      />
      <button type="button" className="note-body" onClick={() => onOpen(note.id)}>
        <span className="note-text">{preview}</span>
        {showFolder && (
          <span className="folder-tag">
            <span className="dot" aria-hidden="true" />
            {folderName}
          </span>
        )}
      </button>
      {imageCount > 0 && (
        <button
          type="button"
          className="icon-btn icon-btn--tint"
          onClick={() => onViewImages(note.id)}
          aria-label={`View ${imageCount === 1 ? 'picture' : `${imageCount} pictures`}`}
          title="View pictures"
        >
          <ImageIcon />
          {imageCount > 1 && <span className="icon-count">{imageCount}</span>}
        </button>
      )}
    </li>
  );
}
