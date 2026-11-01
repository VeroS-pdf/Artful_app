import { useRef, useState } from 'react';
import { colorVars } from '../colors';
import { prepareImages, skippedMessage } from '../store/images';
import { useStore } from '../store/StoreProvider';
import { ConfirmDialog } from './ConfirmDialog';
import { CloseIcon, ImageIcon, PaperclipIcon, TrashIcon } from './Icons';
import { ImageGallery } from './ImageGallery';
import { Modal } from './Modal';
import { useAutosize } from './useAutosize';

interface NoteDetailProps {
  noteId: string;
  onClose: () => void;
}

const formatDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

/** The expanded view of a note: full text, folder, check-off, and its pictures. */
export function NoteDetail({ noteId, onClose }: NoteDetailProps) {
  const { notes, folders, editNote, moveNote, toggleNote, deleteNote, attachImages, removeImage } = useStore();
  const note = notes.find((n) => n.id === noteId);

  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [showImages, setShowImages] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useAutosize(textRef, note?.text ?? '');

  if (!note) return null;

  const folder = folders.find((f) => f.id === note.folderId);
  const imageCount = note.imageIds.length;

  async function onFiles(input: HTMLInputElement) {
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (files.length === 0 || !note) return;

    const { images, skipped } = await prepareImages(files);
    try {
      if (images.length > 0) await attachImages(note.id, images.map((i) => i.blob));
      setError(skipped > 0 ? skippedMessage(skipped) : null);
    } catch {
      setError('Couldn’t save the picture. Your browser may be out of storage space.');
    }
  }

  return (
    <>
      <Modal label="Note" onClose={onClose} style={colorVars(folder?.color ?? note.originColor)}>
        <div className="detail-top">
          <label className="detail-complete">
            <input
              type="checkbox"
              className="check"
              checked={note.completed}
              onChange={() => toggleNote(note.id)}
            />
            {note.completed ? 'Completed' : 'Mark complete'}
          </label>
          <span className="detail-spacer" />
          <button type="button" className="icon-btn" aria-label="Close note" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="detail-editor">
          <textarea
            ref={textRef}
            className="detail-text"
            aria-label="Note text"
            placeholder="Write something…"
            value={note.text}
            onChange={(e) => editNote(note.id, e.target.value)}
          />
        </div>

        <div className="detail-tools">
          {imageCount > 0 && (
            <button
              type="button"
              className="btn btn--small"
              aria-pressed={showImages}
              onClick={() => setShowImages((v) => !v)}
            >
              <ImageIcon />
              {showImages ? 'Hide' : 'Show'} {imageCount === 1 ? 'picture' : `${imageCount} pictures`}
            </button>
          )}
          <button type="button" className="btn btn--ghost btn--small" onClick={() => fileRef.current?.click()}>
            <PaperclipIcon />
            Attach picture
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => void onFiles(e.currentTarget)}
          />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {showImages && imageCount > 0 && (
          <ImageGallery ids={note.imageIds} onRemove={(imageId) => removeImage(note.id, imageId)} />
        )}

        <div className="detail-foot">
          {folder ? (
            <label className="detail-folder">
              <span>Folder</span>
              <select value={folder.id} onChange={(e) => moveNote(note.id, e.target.value)}>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="detail-meta">From “{note.originName ?? 'a deleted folder'}”</span>
          )}
          <span className="detail-meta">
            {note.completedAt ? `Completed ${formatDate.format(note.completedAt)}` : `Added ${formatDate.format(note.createdAt)}`}
          </span>
          <button
            type="button"
            className="icon-btn icon-btn--danger"
            aria-label="Delete note"
            title="Delete note"
            onClick={() => setConfirmingDelete(true)}
          >
            <TrashIcon />
          </button>
        </div>
      </Modal>

      {confirmingDelete && (
        <ConfirmDialog
          title="Delete this note?"
          message="This can’t be undone."
          confirmLabel="Delete"
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            deleteNote(note.id);
            onClose();
          }}
        />
      )}
    </>
  );
}
