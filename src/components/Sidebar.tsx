import { useMemo, useState } from 'react';
import { colorVars } from '../colors';
import { useStore } from '../store/StoreProvider';
import type { View } from '../view';
import { CheckCircleIcon, Logo, PlusIcon, SparkleIcon } from './Icons';
import { NewFolderForm } from './NewFolderForm';

interface SidebarProps {
  view: View;
  onNavigate: (view: View) => void;
}

/** Vertical tabs: a "new idea" tab, one per folder, and the Completed archive. */
export function Sidebar({ view, onNavigate }: SidebarProps) {
  const { folders, notes, addFolder } = useStore();
  const [adding, setAdding] = useState(false);

  const openCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of notes) {
      if (!n.completed && n.folderId) counts.set(n.folderId, (counts.get(n.folderId) ?? 0) + 1);
    }
    return counts;
  }, [notes]);
  const completedCount = useMemo(() => notes.filter((n) => n.completed).length, [notes]);

  const current = (active: boolean) => (active ? ('page' as const) : undefined);

  return (
    <aside className="sidebar">
      <div className="brand">
        <Logo />
        Artful
      </div>

      <button
        type="button"
        className="side-item"
        aria-current={current(view.kind === 'landing')}
        onClick={() => onNavigate({ kind: 'landing' })}
      >
        <SparkleIcon />
        <span className="side-name">New idea</span>
      </button>

      <p className="side-label">Folders</p>
      <nav className="side-folders" aria-label="Folders">
        {folders.map((f) => (
          <button
            key={f.id}
            type="button"
            className="side-item"
            style={colorVars(f.color)}
            aria-current={current(view.kind === 'folder' && view.id === f.id)}
            onClick={() => onNavigate({ kind: 'folder', id: f.id })}
          >
            <span className="dot" aria-hidden="true" />
            <span className="side-name">{f.name}</span>
            {(openCounts.get(f.id) ?? 0) > 0 && <span className="count">{openCounts.get(f.id)}</span>}
          </button>
        ))}

        {adding ? (
          <NewFolderForm
            onCancel={() => setAdding(false)}
            onCreate={(name, color) => {
              const id = addFolder(name, color);
              setAdding(false);
              onNavigate({ kind: 'folder', id });
            }}
          />
        ) : (
          <button type="button" className="side-item side-item--add" onClick={() => setAdding(true)}>
            <PlusIcon />
            <span className="side-name">New folder</span>
          </button>
        )}
      </nav>

      <button
        type="button"
        className="side-item side-item--archive"
        aria-current={current(view.kind === 'completed')}
        onClick={() => onNavigate({ kind: 'completed' })}
      >
        <CheckCircleIcon />
        <span className="side-name">Completed</span>
        {completedCount > 0 && <span className="count">{completedCount}</span>}
      </button>
    </aside>
  );
}
