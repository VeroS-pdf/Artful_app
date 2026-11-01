import { colorVars } from '../colors';
import { useStore } from '../store/StoreProvider';
import { CloseIcon } from './Icons';
import { ImageGallery } from './ImageGallery';
import { Modal } from './Modal';

interface ImageViewerProps {
  noteId: string;
  onClose: () => void;
}

/** Pop-up opened from the little image icon on a note in a list. */
export function ImageViewer({ noteId, onClose }: ImageViewerProps) {
  const { notes, folders } = useStore();
  const note = notes.find((n) => n.id === noteId);
  if (!note || note.imageIds.length === 0) return null;

  const folder = folders.find((f) => f.id === note.folderId);

  return (
    <Modal
      label="Attached pictures"
      onClose={onClose}
      className="modal--wide"
      style={colorVars(folder?.color ?? note.originColor)}
    >
      <div className="viewer-head">
        <h2 className="modal-title">Pictures</h2>
        <button type="button" className="icon-btn" aria-label="Close pictures" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <ImageGallery ids={note.imageIds} />
    </Modal>
  );
}
