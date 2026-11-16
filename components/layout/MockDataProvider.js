"use client";

import { createContext, use, useState } from "react";
import { AUTH_PART_LABELS } from "@/lib/authConfig";
import { useAuth } from "./AuthProvider";
import useProjectData from "@/components/project/useProjectData";

const MockDataContext = createContext(null);

// 여러 화면이 함께 쓰는 로그인 사용자·프로젝트 데이터와, 화면을 옮겨 가서 띄울 토스트를 제공한다.
// 목업 데이터는 가져오지 않는다. 목업 응답은 lib/auth.js가 mock 모드일 때만 불러오는 목업 API가 만든다.
export default function MockDataProvider({ children }) {
  const { user, isDemo } = useAuth();
  return <MockDataState key={`${user?.id ?? "anonymous"}:${isDemo}`} authenticatedUser={user}>{children}</MockDataState>;
}

function MockDataState({ authenticatedUser, children }) {
  const projectData = useProjectData(authenticatedUser);
  // 화면에 보이는 파트 이름으로 바꿔 둔다. 로그인 전에는 없다(사용자를 쓰는 화면은 로그인 가드 안에 있다).
  const user = authenticatedUser ? { ...authenticatedUser, part: AUTH_PART_LABELS[authenticatedUser.part] } : null;
  // 다른 화면으로 옮겨 가서 띄울 토스트다. 예: 프로젝트를 지우고 목록에서 안내(H-25).
  const [flashToast, setFlashToast] = useState(null);

  function showFlashToast(message) {
    setFlashToast({ id: crypto.randomUUID(), message });
  }

  return (
    <MockDataContext
      value={{
        user,
        projects: projectData.projects,
        addProject: projectData.create,
        projectData,
        flashToast,
        showFlashToast,
        hideFlashToast: () => setFlashToast(null),
      }}
    >
      {children}
    </MockDataContext>
  );
}

export function useMockData() {
  return use(MockDataContext);
}
