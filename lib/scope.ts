// path: lib/scope.ts
import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export type DashboardScope =
  | { type: "overview" }
  | { type: "branch"; branchId: string };

export function useDashboardScope() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const scope: DashboardScope = useMemo(() => {
    const branchId = searchParams.get("branchId");
    if (branchId) return { type: "branch", branchId };
    return { type: "overview" };
  }, [searchParams]);

  const setScope = useCallback(
    (next: DashboardScope) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.type === "overview") {
        params.delete("branchId");
      } else {
        params.set("branchId", next.branchId);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  return { scope, setScope };
}