import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'danger' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onClose: (id: string) => void }> = ({
  toast,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-brand-success" />,
    warning: <AlertTriangle className="w-5 h-5 text-brand-warning" />,
    danger: <XCircle className="w-5 h-5 text-brand-danger" />,
    info: <Info className="w-5 h-5 text-brand-accent" />,
  };

  const bgColors = {
    success: 'bg-white border-l-4 border-brand-success',
    warning: 'bg-white border-l-4 border-brand-warning',
    danger: 'bg-white border-l-4 border-brand-danger',
    info: 'bg-white border-l-4 border-brand-primary',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`pointer-events-auto flex gap-3 p-4 rounded-xl shadow-lg border border-brand-border/60 ${bgColors[toast.type]} backdrop-blur-md`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-brand-text font-display leading-tight">{toast.title}</h4>
        <p className="text-xs text-brand-muted mt-1 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 text-brand-muted hover:text-brand-text transition-colors h-fit p-0.5 hover:bg-brand-bg rounded-md"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
