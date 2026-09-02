"use client";

import { useEffect, useSyncExternalStore, type ComponentProps } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
let openLayers = 0;
let previousOverflow = "";

/** Full-viewport modal surface, outside page transforms and navigation stacking.
 * Mount only while open (or while AnimatePresence is running its exit).
 * Equal stacking levels preserve opening order for nested confirmations.
 */
export function ModalLayer({ className, ...props }: ComponentProps<"div">) {
  const isClient = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);

  useEffect(() => {
    if (!isClient) return;
    if (openLayers++ === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    return () => {
      if (--openLayers === 0) document.body.style.overflow = previousOverflow;
    };
  }, [isClient]);

  if (!isClient) return null;

  return createPortal(
    <div {...props} data-modal-layer="" className={cn("fixed inset-0 isolate z-[100]", className)} />,
    document.body,
  );
}
