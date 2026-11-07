"use client";

import { useEffect, useEffectEvent, useState } from "react";

const TOAST_DURATION_MS = 3000;

// 토스트를 띄울 때마다 새 값(id)을 만들어, 같은 문구를 다시 띄워도 3초를 새로 센다.
export function useToast() {
  const [toast, setToast] = useState(null);

  return {
    toast,
    showToast: (message) => setToast({ id: crypto.randomUUID(), message }),
    hideToast: () => setToast(null),
  };
}

export default function Toast({ toast, onDismiss }) {
  const dismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(dismiss, TOAST_DURATION_MS);

    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed bottom-[calc(24px+env(safe-area-inset-bottom,0px))] left-1/2 z-50 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-center text-body-sm text-white shadow-[0_8px_24px_#1f243333]"
    >
      {toast.message}
    </div>
  );
}
