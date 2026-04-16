"use client";

import { useEffect } from "react";

/**
 * Prevents iOS Safari from staying zoomed in after an input loses focus.
 * When any input/textarea blurs, we briefly force maximum-scale=1 then
 * restore the original viewport — this snaps the browser back to scale 1.
 */
export default function IOSZoomFix() {
  useEffect(() => {
    function resetZoom() {
      const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
      if (!meta) return;
      const original = meta.content;
      // Force reset
      meta.content = "width=device-width, initial-scale=1, maximum-scale=1";
      // Restore after snap
      requestAnimationFrame(() => {
        meta.content = original;
      });
    }

    document.addEventListener("focusout", resetZoom, true);
    return () => document.removeEventListener("focusout", resetZoom, true);
  }, []);

  return null;
}
