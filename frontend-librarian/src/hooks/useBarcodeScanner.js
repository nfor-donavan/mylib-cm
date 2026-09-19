import { useEffect, useRef } from "react";

/**
 * USB barcode scanners behave like a very fast keyboard: they "type" the
 * barcode string character by character, then send an Enter keystroke.
 * This hook buffers keystrokes and fires onScan(code) once Enter arrives.
 *
 * It ignores input while the user is typing in a normal text field (so it
 * doesn't interfere with the search box or forms), unless `alwaysActive`
 * is set — useful for a dedicated checkout screen with no other inputs.
 */
export function useBarcodeScanner(onScan, { alwaysActive = false, minLength = 4 } = {}) {
  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);

  useEffect(() => {
    function isTypingInField(target) {
      const tag = target.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
    }

    function handleKeyDown(e) {
      if (!alwaysActive && isTypingInField(e.target)) return;

      const now = Date.now();
      // Scanners type extremely fast (a few ms between characters). If the
      // gap since the last keystroke is large, assume it's a fresh buffer —
      // a human typing normally wouldn't trigger a false scan.
      if (now - lastKeyTimeRef.current > 300) {
        bufferRef.current = "";
      }
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        const code = bufferRef.current.trim();
        bufferRef.current = "";
        if (code.length >= minLength) {
          onScan(code);
        }
        return;
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onScan, alwaysActive, minLength]);
}
