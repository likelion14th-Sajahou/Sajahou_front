"use client";
import { useEffect, useRef, useState } from "react";

// 저장 실패 시 입력을 유지하고, 이탈 시 늦은 응답이 화면에 반영되지 않게 한다.
export default function useProjectAction() {
  const active = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => () => active.current?.abort(), []);
  async function run(action) {
    if (active.current) return false;
    const controller = new AbortController(); active.current = controller; setBusy(true); setError("");
    try { await action(controller.signal); return !controller.signal.aborted; }
    catch (error) { if (!controller.signal.aborted) setError(error.message); return false; }
    finally { active.current = null; if (!controller.signal.aborted) setBusy(false); }
  }
  return { run, busy, error };
}
