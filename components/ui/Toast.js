"use client";

import { useEffect, useEffectEvent } from "react";

const TOAST_DURATION_MS = 3000;

export default function Toast({ message, onDismiss }) {
  const dismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timer = setTimeout(dismiss, TOAST_DURATION_MS);

    return () => clearTimeout(timer);
  }, [message]);

  if (!message) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed bottom-[calc(24px+env(safe-area-inset-bottom,0px))] left-1/2 z-50 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-center text-body-sm text-white shadow-[0_8px_24px_#1f243333]"
    >
      {message}
    </div>
  );
}
