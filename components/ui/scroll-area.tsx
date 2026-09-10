"use client";

import { useEffect, useId, useRef, useState, type HTMLAttributes } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/** Persistent mouse controls, independent of OS auto-hiding scrollbars. */
export function ScrollArea({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  const id = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<number | null>(null);
  const [metrics, setMetrics] = useState({ top: 0, max: 0, ratio: 1 });

  useEffect(() => {
    const element = viewport.current;
    if (!element || !content.current) return;
    const measure = () => setMetrics({ top: element.scrollTop, max: Math.max(0, element.scrollHeight - element.clientHeight), ratio: element.clientHeight / (element.scrollHeight || 1) });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(content.current);
    element.addEventListener("scroll", measure, { passive: true });
    measure();
    return () => { observer.disconnect(); element.removeEventListener("scroll", measure); };
  }, []);

  const scrollBy = (amount: number) => viewport.current?.scrollBy({ top: amount, behavior: "instant" });
  const thumbPercent = Math.max(8, metrics.ratio * 100);
  const position = metrics.max ? (metrics.top / metrics.max) * (100 - thumbPercent) : 0;
  const seek = (clientY: number) => {
    const rect = track.current?.getBoundingClientRect();
    if (!rect || !viewport.current) return;
    const thumbHeight = rect.height * thumbPercent / 100;
    const available = rect.height - thumbHeight;
    if (available <= 0) return;
    viewport.current.scrollTop = Math.max(0, Math.min(1, (clientY - rect.top - (dragOffset.current ?? thumbHeight / 2)) / available)) * metrics.max;
  };

  return <div {...props} className={`flex min-h-0 min-w-0 overflow-hidden ${className}`}>
    <div id={id} ref={viewport} tabIndex={0} aria-label="Scrollable content" className="scroll-area-viewport min-h-0 min-w-0 flex-1 overflow-y-auto">
      <div ref={content} className="min-w-0 flow-root">{children}</div>
    </div>
    {metrics.max > 1 && <div className="flex w-6 shrink-0 flex-col items-center border-l border-grey-4 bg-grey-5 py-1">
      <button type="button" aria-label="Scroll up" disabled={metrics.top <= 0} onClick={() => scrollBy(-240)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-grey-2 hover:bg-grey-4 disabled:opacity-30"><ChevronUp size={16} /></button>
      <div ref={track} role="scrollbar" aria-label="Vertical scroll" aria-controls={id} aria-orientation="vertical" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(metrics.top / metrics.max * 100)} tabIndex={0}
        className="relative my-1 w-5 min-h-10 flex-1 touch-none cursor-pointer rounded bg-grey-4/60 focus-visible:outline-primary-1"
        onKeyDown={(event) => {
          const page = viewport.current?.clientHeight ?? 400;
          const amounts: Record<string, number> = { ArrowUp: -40, ArrowDown: 40, PageUp: -page, PageDown: page, Home: -metrics.max, End: metrics.max };
          if (event.key in amounts) { event.preventDefault(); scrollBy(amounts[event.key]); }
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.currentTarget.focus();
          event.currentTarget.setPointerCapture(event.pointerId);
          const rect = event.currentTarget.getBoundingClientRect();
          const thumbTop = rect.top + rect.height * position / 100;
          const thumbHeight = rect.height * thumbPercent / 100;
          dragOffset.current = event.clientY >= thumbTop && event.clientY <= thumbTop + thumbHeight ? event.clientY - thumbTop : thumbHeight / 2;
          seek(event.clientY);
        }}
        onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) seek(event.clientY); }}
        onLostPointerCapture={() => { dragOffset.current = null; }}
        onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}>
        <div className="absolute left-1.5 right-1.5 rounded-full bg-grey-3 hover:bg-grey-2" style={{ top: `${position}%`, height: `${thumbPercent}%` }} />
      </div>
      <button type="button" aria-label="Scroll down" disabled={metrics.top >= metrics.max - 1} onClick={() => scrollBy(240)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-grey-2 hover:bg-grey-4 disabled:opacity-30"><ChevronDown size={16} /></button>
    </div>}
  </div>;
}
