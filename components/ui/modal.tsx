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
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
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
      <div className="flex h-[75dvh] w-full max-w-[840px] flex-col overflow-hidden rounded-[12px] bg-white shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
        {(title || subtitle) && (
          <div className="flex h-[75px] shrink-0 items-center justify-between border-b border-grey-4 px-6">
            <div>
              {title && <h2 className="!text-base !leading-6 font-sans font-bold text-grey-1">{title}</h2>}
              {subtitle && <p className="text-xs leading-[18px] text-grey-3">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-[12px] text-grey-3 hover:bg-grey-5 hover:text-grey-1" aria-label="Close modal">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <div className="min-h-0 flex-1 overflow-y-auto p-5 scrollbar-hide">
          {children}
        </div>

        {footer && (
          <div className="flex h-[75px] shrink-0 items-center justify-end gap-3 border-t border-grey-4 bg-grey-5 px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
