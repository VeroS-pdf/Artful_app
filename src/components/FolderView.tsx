import { useMemo, useRef, useState, type FormEvent } from 'react';
import { colorVars } from '../colors';
import { useStore } from '../store/StoreProvider';
import type { Folder } from '../types';
import { ColorPicker } from './ColorPicker';
import { ConfirmDialog } from './ConfirmDialog';
import { ChevronIcon, FolderIcon, PlusIcon, TrashIcon } from './Icons';
import { NoteRow } from './NoteRow';
import { useAutosize } from './useAutosize';

interface FolderViewProps {
  folder: Folder;
  onOpenNote: (noteId: string) => void;
  onViewImages: (noteId: string) => void;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** One folder: editable name and color, its open notes, and a "Completed" subfolder. */
export function FolderView({ folder, onOpenNote, onViewImages }: FolderViewProps) {
  const { notes, addNote, renameFolder, recolorFolder, deleteFolder } = useStore();
  const [name, setName] = useState(folder.name);
  const [pickingColor, setPickingColor] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { open, done } = useMemo(() => {
    const mine = notes.filter((n) => n.folderId === folder.id);
    return {
      open: mine.filter((n) => !n.completed).sort((a, b) => b.createdAt - a.createdAt),
      done: mine.filter((n) => n.completed).sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)),
    };
  }, [notes, folder.id]);

  const deleteMessage = [
    open.length > 0 ? `${plural(open.length, 'open note')} will be deleted.` : 'This folder has no open notes.',
    done.length > 0 ? `${plural(done.length, 'completed note')} will stay in the Completed archive.` : '',
  ]
    .join(' ')
    .trim();

  return (
    <section className="panel" style={colorVars(folder.color)}>
      <header className="folder-head">
        <button
          type="button"
          className="swatch-btn"
          aria-label="Change folder color"
          aria-expanded={pickingColor}
          title="Change color"
          onClick={() => setPickingColor((v) => !v)}
        >
          <span className="dot dot--large" aria-hidden="true" />
        </button>
        <input
          className="folder-title"
          aria-label="Folder name"
          title="Click to rename"
          value={name}
          maxLength={60}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) renameFolder(folder.id, e.target.value);
          }}
          onBlur={() => setName(folder.name)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
        />
        <button
          type="button"
          className="icon-btn icon-btn--danger"
          aria-label="Delete folder"
          title="Delete folder"
          onClick={() => setConfirmingDelete(true)}
        >
          <TrashIcon />
        </button>
      </header>

      {pickingColor && (
        <div className="folder-colors">
          <ColorPicker value={folder.color} onChange={(c) => recolorFolder(folder.id, c)} />
        </div>
      )}

      <p className="folder-meta">{plural(open.length, 'note')}</p>

      <QuickAdd onAdd={(text) => addNote(folder.id, text, [])} />

      {open.length > 0 ? (
        <ul className="note-list">
          {open.map((n) => (
            <NoteRow key={n.id} note={n} onOpen={onOpenNote} onViewImages={onViewImages} />
          ))}
        </ul>
      ) : (
        <p className="empty">
          {done.length > 0 ? 'Everything here is done. Nice!' : 'No notes yet. Add one above, or from the New idea tab.'}
        </p>
      )}

      <div className="subfolder">
        <button
          type="button"
          className="subfolder-head"
          aria-expanded={showCompleted}
          onClick={() => setShowCompleted((v) => !v)}
        >
          <span className={`chevron${showCompleted ? ' is-open' : ''}`}>
            <ChevronIcon />
          </span>
          <FolderIcon />
          Completed
          <span className="count">{done.length}</span>
        </button>
        {showCompleted &&
          (done.length > 0 ? (
            <ul className="note-list">
              {done.map((n) => (
                <NoteRow key={n.id} note={n} onOpen={onOpenNote} onViewImages={onViewImages} />
              ))}
            </ul>
          ) : (
            <p className="empty">Checked-off notes will show up here.</p>
          ))}
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title={`Delete “${folder.name}”?`}
          message={deleteMessage}
          confirmLabel="Delete folder"
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            setConfirmingDelete(false);
            deleteFolder(folder.id);
          }}
        />
      )}
    </section>
  );
}

/** A "New note" row at the top of the list. Enter adds it; Shift+Enter starts a new line. */
function QuickAdd({ onAdd }: { onAdd: (text: string) => Promise<void> }) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutosize(ref, text);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!text.trim()) return;
    void onAdd(text);
    setText('');
  }

  return (
    <form className="quick-add" onSubmit={submit}>
      <span className="quick-add-icon">
        <PlusIcon />
      </span>
      <textarea
        ref={ref}
        rows={1}
        aria-label="New note"
        placeholder="New note"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) submit(e);
        }}
      />
    </form>
  );
}
