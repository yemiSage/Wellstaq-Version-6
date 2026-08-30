// path: lib/scope.ts
import { useCallback, useEffect, useMemo, useRef, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";

export type DashboardScope =
  | { type: "overview" }
  | { type: "branch"; branchId: string };

function isSameScope(first: DashboardScope, second: DashboardScope) {
  return first.type === second.type && (
    first.type === "overview" || (second.type === "branch" && first.branchId === second.branchId)
  );
}

export function useDashboardScope() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isScopeChanging, startScopeTransition] = useTransition();
  const pendingScope = useRef<{ scope: DashboardScope; label: string } | null>(null);

  const scope: DashboardScope = useMemo(() => {
    const branchId = searchParams.get("branchId");
    if (branchId) return { type: "branch", branchId };
    return { type: "overview" };
  }, [searchParams]);

  useEffect(() => {
    const pending = pendingScope.current;
    if (!pending || isScopeChanging) return;
    pendingScope.current = null;

    if (isSameScope(scope, pending.scope)) {
      toast.success(
        scope.type === "branch" ? `Branch changed to ${pending.label}.` : "Switched to Overview.",
      );
    } else {
      toast.error("Couldn't change branch. Try again.");
    }
  }, [isScopeChanging, scope]);

  const setScope = useCallback(
    (next: DashboardScope, label = next.type === "overview" ? "Overview" : "selected branch") => {
      if (isScopeChanging || isSameScope(scope, next)) return;
      const params = new URLSearchParams(searchParams.toString());
      if (next.type === "overview") {
        params.delete("branchId");
      } else {
        params.set("branchId", next.branchId);
      }
      const query = params.toString();
      pendingScope.current = { scope: next, label };
      startScopeTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname);
      });
    },
    [isScopeChanging, pathname, router, scope, searchParams, startScopeTransition],
  );

  return { scope, setScope, isScopeChanging };
}
