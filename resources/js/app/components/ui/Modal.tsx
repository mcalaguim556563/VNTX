import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

const sizeStyles: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Use a React Portal so the modal renders directly in <body>,
  // escaping any overflow:hidden / overflow:auto ancestor containers
  // that would clip a fixed-position element.
  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] overflow-y-auto"
      style={{ backgroundColor: 'rgba(5, 11, 26, 0.88)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Centering wrapper */}
      <div className="flex min-h-full w-full items-start justify-center px-4 py-10 sm:items-center sm:py-8">
        <div
          className={`
            relative w-full ${sizeStyles[size]} rounded-2xl border border-[#1E3A5C]
            bg-[#0A1628] shadow-2xl shadow-black/70
            animate-fade-in
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E3A5C] sticky top-0 bg-[#0A1628] rounded-t-2xl z-10">
              <h2 id="modal-title" className="text-base font-bold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-[#1E3A5C] transition-colors"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-5">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1E3A5C]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
