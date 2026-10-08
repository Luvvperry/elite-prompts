import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export type ToastPayload = {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
} | null;

interface ToastHostProps {
  toast: ToastPayload;
  onClose: () => void;
}

const ToastHost: React.FC<ToastHostProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="toast-host" role="status" aria-live="polite">
      <div className={`toast-card toast-${toast.type}`}>
        <div className="toast-icon" aria-hidden="true">
          {toast.type === 'error' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
        </div>
        <div className="toast-message">{toast.message}</div>
        <button type="button" className="toast-close" onClick={onClose} aria-label="Close notification">
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

export default ToastHost;
