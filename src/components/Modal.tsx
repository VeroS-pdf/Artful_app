import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

interface ModalProps {
  label: string;
  onClose: () => void;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * A modal built on the native <dialog>, which gives us the focus trap, the Escape key
 * and the backdrop for free. `onClose` fires however the dialog closes.
 */
export function Modal({ label, onClose, className = '', style, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const pressedBackdrop = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    // Remember what had focus (only the first time, so React's dev double-run doesn't overwrite it).
    opener.current ??= document.activeElement;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (opener.current instanceof HTMLElement) opener.current.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      style={style}
      aria-label={label}
      onClose={onClose}
      // Only a press that both starts and ends on the backdrop closes it, so dragging a
      // text selection out of the note doesn't dismiss the dialog by accident.
      onMouseDown={(e) => {
        pressedBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (pressedBackdrop.current && e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className="modal-body">{children}</div>
    </dialog>
  );
}
