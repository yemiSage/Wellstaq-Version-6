"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      const currentRoute = `${window.location.pathname}${window.location.search}`;
      const nextRoute = `${destination.pathname}${destination.search}`;
      if (currentRoute === nextRoute) return;

      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);

      setActive(true);
      setProgress(12);
      requestAnimationFrame(() => setProgress(72));

      safetyTimer.current = setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 12000);
    };

    document.addEventListener("click", start, true);
    return () => document.removeEventListener("click", start, true);
  }, []);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    setActive(true);
    setProgress(100);
    hideTimer.current = setTimeout(() => {
      setActive(false);
      setProgress(0);
    }, 180);
  }, [pathname]);

  useEffect(
    () => () => {
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  if (!active) return null;

  return (
    <div
      aria-label="Loading page"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={progress}
      className="pointer-events-none fixed left-0 top-0 z-[200] h-[2px] bg-primary-1 shadow-[0_0_8px_rgba(234,106,5,0.55)] transition-[width] duration-300 ease-out"
      role="progressbar"
      style={{ width: `${progress}%` }}
    />
  );
}
