"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ModalLayer } from "./modal-layer";

interface DrawerLayerProps {
  children: ReactNode;
  onClose: () => void;
  label: string;
  inert?: boolean;
}

/** Use inside AnimatePresence when the caller conditionally mounts its form. */
export function DrawerLayer({ children, onClose, label, inert }: DrawerLayerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const reduceMotion = useReducedMotion();
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const panel = panelRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
    ) ?? []).filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);
    (focusable()[0] ?? panel)?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      const layers = document.querySelectorAll('[data-modal-layer]');
      if (panel?.closest('[data-modal-layer]') !== layers[layers.length - 1]) return;
      if (event.defaultPrevented) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      } else if (event.key === "Tab") {
        const elements = focusable();
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (!first) { event.preventDefault(); panel?.focus(); }
        else if (event.shiftKey && (document.activeElement === first || !panel?.contains(document.activeElement))) {
          event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !panel?.contains(document.activeElement))) {
          event.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  const hidden = reduceMotion ? { opacity: 0, transform: "translateX(0)" } : { opacity: 1, transform: "translateX(100%)" };
  return (
    <ModalLayer inert={inert} className="flex items-stretch justify-end">
      <motion.div aria-hidden="true" className="absolute inset-0 bg-black/40" onClick={onClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
      <motion.div ref={panelRef} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}
        className="relative h-[100dvh] min-h-0 w-full overflow-hidden bg-white shadow-xl outline-none sm:max-w-[480px]"
        initial={hidden} animate={{ opacity: 1, transform: "translateX(0)" }} exit={hidden}
        transition={{ duration: reduceMotion ? 0.15 : 0.25, ease: [0.32, 0.72, 0, 1] }}>
        {children}
      </motion.div>
    </ModalLayer>
  );
}

export function Drawer({ isOpen, ...props }: DrawerLayerProps & { isOpen: boolean }) {
  return <AnimatePresence>{isOpen && <DrawerLayer {...props} />}</AnimatePresence>;
}
