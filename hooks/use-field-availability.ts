// path: hooks/use-field-availability.ts
import { useEffect, useRef, useState } from "react";

export type AvailabilityStatus = "idle" | "checking" | "available" | "taken" | "error";

export function useFieldAvailability(
  value: string,
  checkFn: (value: string) => Promise<{ available: boolean }>,
  options: { minLength?: number; delayMs?: number } = {},
) {
  const { minLength = 2, delayMs = 500 } = options;
  const [status, setStatus] = useState<AvailabilityStatus>("idle");
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length < minLength) {
      setStatus("idle");
      return;
    }

    setStatus("checking");
    const currentRequestId = ++requestIdRef.current;

    const timer = setTimeout(async () => {
      try {
        const result = await checkFn(trimmed);
        if (requestIdRef.current !== currentRequestId) return; // stale response, ignore
        setStatus(result.available ? "available" : "taken");
      } catch {
        if (requestIdRef.current !== currentRequestId) return;
        setStatus("error");
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, minLength, delayMs, checkFn]);

  return status;
}