import { useEffect, useRef } from "react";

export function useAppNavigate(
  keys: readonly string[],
  onView: (view: string) => void,
  viewMap?: Record<string, string>
) {
  const onViewRef = useRef(onView);
  onViewRef.current = onView;
  const viewMapRef = useRef(viewMap);
  viewMapRef.current = viewMap;

  useEffect(() => {
    const keySet = new Set(keys);
    const handler = (e: Event) => {
      const raw = (e as CustomEvent<string>).detail;
      if (!raw) return;
      let view = raw;
      try { const p = JSON.parse(raw); if (p.view) view = p.view; } catch {}
      const target = viewMapRef.current?.[view] ?? view;
      if (keySet.has(target)) onViewRef.current(target);
    };
    window.addEventListener("app:navigate", handler);
    return () => window.removeEventListener("app:navigate", handler);
  }, [keys]);
}
