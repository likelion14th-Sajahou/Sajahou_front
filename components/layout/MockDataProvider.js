"use client";

import { createContext, use, useState } from "react";
import { MOCK_PROJECTS } from "@/lib/mock/projects";

const MockDataContext = createContext(null);

// API가 없는 동안 화면끼리 공유하는 목업 데이터다. 페이지를 옮겨 다녀도 유지되고, 새로고침하면 처음 값으로 돌아간다.
// API를 연결할 때 이 안쪽을 실제 요청으로 바꾸면 화면 코드는 그대로 쓸 수 있다.
export default function MockDataProvider({ children }) {
  const [projects, setProjects] = useState(MOCK_PROJECTS);

  function addProject(project) {
    setProjects((current) => [...current, project]);
  }

  function updateProject(projectId, update) {
    setProjects((current) =>
      current.map((project) => (project.id === projectId ? update(project) : project)),
    );
  }

  return (
    <MockDataContext value={{ projects, addProject, updateProject }}>
      {children}
    </MockDataContext>
  );
}

export function useMockData() {
  return use(MockDataContext);
}
