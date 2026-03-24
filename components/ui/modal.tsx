"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "max-w-[612px]",
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl w-full ${maxWidth} overflow-hidden flex flex-col max-h-[90vh]`}>
        {(title || subtitle) && (
          <div className="p-6 border-b border-grey-4 flex justify-between items-start">
            <div>
              {title && <h2 className="text-xl font-bold text-grey-1 mb-1">{title}</h2>}
              {subtitle && <p className="text-sm text-grey-2">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="text-grey-3 hover:text-grey-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
          {children}
        </div>

        {footer && (
          <div className="p-6 border-t border-grey-4 flex justify-end gap-3 bg-grey-5/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
