"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as api from "@/lib/projectApi";
import { projectView, roleCodes } from "@/lib/projectViewModel";

export default function useProjectData(user) {
  const [projects, setProjects] = useState([]);
  const [competencyItems, setCompetencyItems] = useState([]);
  const [home, setHome] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const loaded = useRef(new Map());
  const current = useRef(0);

  const refresh = useCallback(async ({ signal } = {}) => {
    if (!user) return;
    const version = ++current.current;
    const [list, competencies, home] = await Promise.all([api.listProjects({ signal }), api.getProjectCompetencies({ signal }), api.getProjectHome({ signal })]);
    if (signal?.aborted || version !== current.current) return;
    setProjects([...list.inProgressProjects.map((p) => projectView(p, "IN_PROGRESS")), ...list.doneProjects.map((p) => projectView(p, "DONE"))]
      .map((p) => loaded.current.has(p.id) ? { ...loaded.current.get(p.id), ...p, startedAt: loaded.current.get(p.id).startedAt, records: loaded.current.get(p.id).records } : p));
    setCompetencyItems(competencies); setHome(home); setStatus("ready"); setError("");
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();
    refresh({ signal: controller.signal }).catch((error) => {
      if (!controller.signal.aborted) { setError(error.message); setStatus("error"); }
    });
    return () => { controller.abort(); current.current += 1; };
  }, [refresh]);

  const loadProject = useCallback(async (id, { signal } = {}) => {
    const result = projectView(await api.getProject(id, { signal }));
    if (signal?.aborted) return;
    loaded.current.set(result.id, result);
    setProjects((previous) => previous.some((p) => p.id === result.id) ? previous.map((p) => p.id === result.id ? result : p) : [...previous, result]);
    return result;
  }, []);

  async function create(values) {
    const result = await api.createProject({ name: values.name, subtitle: values.subtitle ?? null, roles: roleCodes(values.roles) });
    await refresh();
    return result;
  }

  return { projects, competencyItems, home, status, error, refresh, loadProject, create };
}
