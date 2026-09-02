"use client";

import React from "react";
import { X } from "lucide-react";
import { ModalLayer } from "./modal-layer";
import { Drawer } from "./drawer";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  presentation?: "modal" | "drawer";
  size?: "compact" | "default";
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  presentation = "modal",
  size = "default",
}: ModalProps) {
  if (presentation === "modal" && !isOpen) return null;

  const content = (
      <div className={presentation === "drawer" ? "flex h-full w-full flex-col overflow-hidden bg-white" : `flex max-h-[calc(100dvh-32px)] w-full flex-col overflow-hidden rounded-[12px] border border-grey-4 bg-white shadow-[0px_16px_32px_-16px_rgba(0,0,0,0.24)] ${size === "compact" ? "max-w-[440px]" : "max-w-[620px]"}`}>
        {(title || subtitle) && (
          <div className="flex min-h-16 shrink-0 items-center justify-between border-b border-grey-4 px-5">
            <div>
              {title && <h2 className="!text-base !leading-6 font-sans font-bold text-grey-1">{title}</h2>}
              {subtitle && <p className="text-xs leading-[18px] text-grey-3">{subtitle}</p>}
            </div>
            <button type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-grey-3 hover:bg-grey-5 hover:text-grey-1" aria-label={presentation === "drawer" ? "Close drawer" : "Close modal"}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <div className="min-h-0 flex-1 overflow-y-auto p-5 scrollbar-hide">
          {children}
        </div>

        {footer && (
          <div className="flex min-h-16 shrink-0 items-center justify-end gap-3 border-t border-grey-4 bg-grey-5 px-5">
            {footer}
          </div>
        )}
      </div>
  );
  return presentation === "drawer"
    ? <Drawer isOpen={isOpen} onClose={onClose} label={title ?? "Edit details"}>{content}</Drawer>
    : <ModalLayer className="bg-black/50 flex items-center justify-center p-4">{content}</ModalLayer>;
}
