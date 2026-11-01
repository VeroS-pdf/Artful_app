import { FOLDER_COLORS, type ColorKey } from '../colors';
import { CheckIcon } from './Icons';

interface ColorPickerProps {
  value: ColorKey;
  onChange: (color: ColorKey) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="color-picker" role="radiogroup" aria-label="Folder color">
      {FOLDER_COLORS.map((c) => (
        <button
          key={c.key}
          type="button"
          role="radio"
          aria-checked={c.key === value}
          aria-label={c.name}
          title={c.name}
          className="color-swatch"
          style={{ background: c.solid, color: c.deep }}
          onClick={() => onChange(c.key)}
        >
          {c.key === value && <CheckIcon />}
        </button>
      ))}
    </div>
  );
}
