import { useState } from 'react';
import { DEFAULT_COLOR, colorVars, type ColorKey } from '../colors';
import { ColorPicker } from './ColorPicker';

interface NewFolderFormProps {
  onCreate: (name: string, color: ColorKey) => void;
  onCancel?: () => void;
}

/** Name + color for a new folder. A <div>, not a <form>, because it is used inside other forms. */
export function NewFolderForm({ onCreate, onCancel }: NewFolderFormProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<ColorKey>(DEFAULT_COLOR);
  const canCreate = name.trim().length > 0;

  function create() {
    if (!canCreate) return;
    onCreate(name, color);
    setName('');
    setColor(DEFAULT_COLOR);
  }

  return (
    <div
      className="new-folder"
      style={colorVars(color)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
          e.preventDefault();
          create();
        } else if (e.key === 'Escape' && onCancel) {
          e.stopPropagation();
          onCancel();
        }
      }}
    >
      <input
        className="text-input"
        placeholder="Folder name"
        aria-label="New folder name"
        value={name}
        maxLength={60}
        autoFocus
        onChange={(e) => setName(e.target.value)}
      />
      <ColorPicker value={color} onChange={setColor} />
      <div className="new-folder-actions">
        <button type="button" className="btn btn--primary btn--small" disabled={!canCreate} onClick={create}>
          Create folder
        </button>
        {onCancel && (
          <button type="button" className="btn btn--ghost btn--small" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
