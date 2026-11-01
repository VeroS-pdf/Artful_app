import { useRef, useState, type FormEvent } from 'react';
import { colorVars } from '../colors';
import { prepareImages, skippedMessage, type PreparedImage } from '../store/images';
import { useStore } from '../store/StoreProvider';
import type { Folder } from '../types';
import { uid } from '../uid';
import { CloseIcon, PaperclipIcon, PlusIcon } from './Icons';
import { NewFolderForm } from './NewFolderForm';

interface LandingProps {
  selectedFolderId: string | null;
  onSelectFolder: (id: string) => void;
  onSaved: (folder: Folder) => void;
}

/** The first screen: an open text box asking "What's the idea?", and a folder to drop the answer into. */
export function Landing({ selectedFolderId, onSelectFolder, onSaved }: LandingProps) {
  const { folders, addFolder, addNote } = useStore();
  const [text, setText] = useState('');
  const [images, setImages] = useState<(PreparedImage & { key: string })[]>([]);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = folders.find((f) => f.id === selectedFolderId) ?? folders[0];
  const showNewFolder = creating || folders.length === 0;
  const canSave = !!selected && !saving && (text.trim().length > 0 || images.length > 0);

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await addNote(selected.id, text, images.map((i) => i.blob));
      onSaved(selected);
      setText('');
      setImages([]);
      textRef.current?.focus();
    } catch {
      setError('Couldn’t save that. Your browser may be out of storage space for pictures.');
    } finally {
      setSaving(false);
    }
  }

  async function onFiles(input: HTMLInputElement) {
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (files.length === 0) return;
    const { images: added, skipped } = await prepareImages(files);
    setImages((prev) => [...prev, ...added.map((i) => ({ ...i, key: uid() }))]);
    setError(skipped > 0 ? skippedMessage(skipped) : null);
  }

  return (
    <section className="landing" style={colorVars(selected?.color)}>
      <form className="landing-inner" onSubmit={submit}>
        <h1 className="landing-title">What’s the idea?</h1>
        <p className="landing-sub">Jot it down now. You can always sort it out later.</p>

        <div className="idea-card">
          <textarea
            ref={textRef}
            className="idea-text"
            aria-label="What's the idea?"
            placeholder="Type anything: a thought, a plan, a tiny spark…"
            value={text}
            autoFocus
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') void submit();
            }}
          />
          <div className="idea-attach">
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
            {images.map((img) => (
              <span key={img.key} className="file-chip">
                <span className="file-chip-name">{img.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${img.name}`}
                  onClick={() => setImages((prev) => prev.filter((i) => i.key !== img.key))}
                >
                  <CloseIcon />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="drop-in">
          <h2 className="drop-in-title" id="drop-in-label">
            Drop it into…
          </h2>
          <div className="folder-chips" role="radiogroup" aria-labelledby="drop-in-label">
            {folders.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={f.id === selected?.id}
                className="folder-chip"
                style={colorVars(f.color)}
                onClick={() => onSelectFolder(f.id)}
              >
                <span className="dot" aria-hidden="true" />
                {f.name}
              </button>
            ))}
            {folders.length > 0 && !creating && (
              <button type="button" className="folder-chip folder-chip--new" onClick={() => setCreating(true)}>
                <PlusIcon />
                New folder
              </button>
            )}
          </div>

          {showNewFolder && (
            <NewFolderForm
              onCancel={folders.length > 0 ? () => setCreating(false) : undefined}
              onCreate={(name, color) => {
                onSelectFolder(addFolder(name, color));
                setCreating(false);
              }}
            />
          )}
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="landing-actions">
          <button type="submit" className="btn btn--primary btn--large" disabled={!canSave}>
            {selected ? `Add to ${selected.name}` : 'Create a folder first'}
          </button>
          <span className="landing-hint">or press ⌘/Ctrl + Enter</span>
        </div>
      </form>
    </section>
  );
}
