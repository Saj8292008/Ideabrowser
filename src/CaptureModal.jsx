import { useEffect, useRef } from 'react';
import CaptureForm from './CaptureForm.jsx';
import Icon from './Icons.jsx';
import { capture } from './content.js';

export default function CaptureModal({ open, source, tier, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} className="modal" aria-labelledby="modal-title" onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      {open && (
        <div className="modal__panel">
          <button className="modal__close" type="button" onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
          {tier && <p className="modal__tier">Reserving: {tier}</p>}
          <h2 id="modal-title" className="h3">Get founding early access</h2>
          <p className="modal__offer">{capture.offer}</p>
          <CaptureForm key={`${source}-${tier}`} source={source} tier={tier} autoFocus showReassurance />
        </div>
      )}
    </dialog>
  );
}
