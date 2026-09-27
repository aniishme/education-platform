import { useEffect } from "react";

// Closes a dropdown when the user clicks outside it, tabs out of it, or presses Escape.
// Escape also returns focus to the dropdown's trigger (its first button).
export default function useDismiss(containerRef, isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return undefined;

    // runs for both mouse clicks and keyboard focus moving outside the dropdown
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) onClose();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        containerRef.current?.querySelector("button")?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("focusin", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("focusin", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, isOpen, onClose]);
}
