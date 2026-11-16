"use client";

import { useEffect, useRef, useState } from "react";
import TextField from "@/components/ui/TextField";

export default function StoryCardSearch({ search, onNavigate }) {
  const [draft, setDraft] = useState({ value: search, search, pending: false });
  const composing = useRef(false);

  // 직접 입력한 값은 늦게 도착한 URL 갱신으로 덮어쓰지 않는다.
  if (draft.search !== search) {
    setDraft({
      value: draft.pending ? draft.value : search,
      search,
      pending: draft.pending && draft.value !== search,
    });
  }

  useEffect(() => {
    function restoreSearch() {
      const value = new URLSearchParams(window.location.search).get("q") ?? "";
      composing.current = false;
      setDraft((previous) => ({ ...previous, value, pending: true }));
    }
    window.addEventListener("popstate", restoreSearch);
    return () => window.removeEventListener("popstate", restoreSearch);
  }, []);

  function updateSearch(value, isComposing) {
    setDraft((previous) => ({ ...previous, value, pending: true }));
    if (isComposing) return;
    const params = new URLSearchParams(window.location.search);
    // 조합 종료 직후 같은 값의 change 이벤트가 와도 URL은 한 번만 갱신한다.
    if ((params.get("q") ?? "") !== value || params.has("card")) {
      onNavigate({ q: value, card: null }, true);
    }
  }

  return (
    <TextField
      drawn
      size="sm"
      wrapperClassName="min-w-[120px] flex-1"
      aria-label="카드 검색"
      value={draft.value}
      onChange={(event) => updateSearch(event.target.value, composing.current || event.nativeEvent.isComposing)}
      onCompositionStart={() => { composing.current = true; }}
      onCompositionEnd={(event) => {
        composing.current = false;
        updateSearch(event.currentTarget.value, false);
      }}
      placeholder="검색"
    />
  );
}
