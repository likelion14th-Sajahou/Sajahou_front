"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import * as api from "@/lib/projectApi";
import { projectView, roleCodes, cardView } from "@/lib/projectViewModel";

export default function useProjectData(user) {
  const { authenticatedRequest } = useAuth();
  const [projects, setProjects] = useState([]);
  const [competencyItems, setCompetencyItems] = useState([]);
  const [cards, setCards] = useState([]);
  const [syncWarning, setSyncWarning] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const loaded = useRef(new Map());
  const current = useRef(0);

  const refresh = useCallback(async ({ signal } = {}) => {
    if (!user) return;
    const version = ++current.current;
    const [list, competencies, cardList] = await Promise.all([api.listProjects({ signal, request: authenticatedRequest }), api.getProjectCompetencies({ signal, request: authenticatedRequest }), api.listProjectCards({ signal, request: authenticatedRequest })]);
    if (signal?.aborted || version !== current.current) return;
    setProjects([...list.inProgressProjects.map((p) => projectView(p, "IN_PROGRESS")), ...list.doneProjects.map((p) => projectView(p, "DONE"))]
      .map((p) => loaded.current.has(p.id) ? { ...loaded.current.get(p.id), ...p, startedAt: loaded.current.get(p.id).startedAt, records: loaded.current.get(p.id).records } : p));
    setCompetencyItems(competencies); setStatus("ready"); setError("");
    setCards(cardList.cards.map(cardView));
  }, [user, authenticatedRequest]);

  useEffect(() => {
    const controller = new AbortController();
    refresh({ signal: controller.signal }).catch((error) => {
      if (!controller.signal.aborted) { setError(error.message); setStatus("error"); }
    });
    return () => { controller.abort(); current.current += 1; };
  }, [refresh]);

  const loadProject = useCallback(async (id, { signal } = {}) => {
    const result = projectView(await api.getProject(id, { signal, request: authenticatedRequest }));
    if (signal?.aborted) return;
    loaded.current.set(result.id, result);
    setProjects((previous) => previous.some((p) => p.id === result.id) ? previous.map((p) => p.id === result.id ? result : p) : [...previous, result]);
    return result;
  }, [authenticatedRequest]);

  async function create(values) {
    const result = await api.createProject({ name: values.name, subtitle: values.subtitle ?? null, roles: roleCodes(values.roles) }, { request: authenticatedRequest });
    setProjects((previous) => [...previous, projectView({ ...result, recordCount: 0, lastRecordDate: null })]);
    try { await refresh(); } catch { setSyncWarning("프로젝트는 생성됐지만 목록 갱신에 실패했어요. 새로고침해 주세요."); }
    return result;
  }

  async function sync(id) {
    try { if (id) await loadProject(id); await refresh(); setSyncWarning(""); }
    catch { setSyncWarning("저장은 완료됐지만 화면을 다시 불러오지 못했어요. 새로고침해 주세요."); }
  }
  function forget(id) {
    loaded.current.delete(id);
    setProjects((previous) => previous.filter((p) => p.id !== id));
    setCards((previous) => previous.filter((c) => c.projectId !== id));
  }
  return { projects, competencyItems, cards, status, error, syncWarning, refresh, loadProject, create, sync, forget };
}
