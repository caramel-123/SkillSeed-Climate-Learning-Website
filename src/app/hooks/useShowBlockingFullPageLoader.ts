import { useSyncExternalStore } from "react";

function visibilitySubscribe(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function visibilitySnapshot() {
  return document.visibilityState === "visible";
}

/**
 * When the document tab is hidden (another browser tab or app focused), do not
 * render a full-page loading shell. After the first load finishes for this
 * screen, never swap back to a full-page loader on refetch — keep stale UI.
 */
export function useShowBlockingFullPageLoader(
  blocking: boolean,
  initialLoadDone: boolean
): boolean {
  const tabVisible = useSyncExternalStore(visibilitySubscribe, visibilitySnapshot, () => true);
  if (!blocking) return false;
  if (initialLoadDone) return false;
  return tabVisible;
}
