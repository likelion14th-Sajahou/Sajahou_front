"use client";

import { createContext, use, useEffect, useState } from "react";
import { getCompetencyNames } from "@/lib/mock/competencies";
import { FOOTPRINT_WEEKS } from "@/lib/mock/myRecord";
import { MOCK_PROJECTS } from "@/lib/mock/projects";
import { MOCK_STORY_CARDS } from "@/lib/mock/storyCards";
import { MOCK_USER } from "@/lib/mock/user";
import { MOCK_WEEK } from "@/lib/mock/week";
import { setMockDemoPart } from "@/lib/mock/demoPart";
import { AUTH_PART_LABELS } from "@/lib/authConfig";
import { useAuth } from "./AuthProvider";
import useProjectData from "@/components/project/useProjectData";
import { getAuthMode } from "@/lib/authConfig";
import { saveMockWeek } from "@/lib/mock/myRecordModel";

const MockDataContext = createContext(null);

const CURRENT_WEEK_STICKER = { shape: "circle", color: "blue" };
const PROJECT_RECAP_STICKER = { shape: "sun", color: "yellow", isProjectRecap: true };

// 사자 발자국과 스티커 보드가 함께 쓰는 주차 목록이다.
// 이번 주 칸은 회고 상태에 따라, 프로젝트 회고 칸은 프로젝트를 완료하면 바뀐다.
// 완료한 뒤 지운 프로젝트의 스티커는 keptRecaps로 남긴다.
function getFootprintWeeks(weekStatus, projects, keptRecaps) {
  return FOOTPRINT_WEEKS.map((item) => {
    const recap =
      projects.find(({ recap, status }) => status === "done" && recap?.week === item.week)?.recap ??
      keptRecaps.find(({ week }) => week === item.week);

    if (recap) {
      return {
        ...item,
        ...PROJECT_RECAP_STICKER,
        status: "done",
        title: recap.title,
      };
    }

    if (item.week !== MOCK_WEEK.week) {
      return item;
    }

    if (weekStatus === "done") {
      return { ...item, status: "done", ...CURRENT_WEEK_STICKER };
    }

    return weekStatus === "paused" ? { ...item, status: "none", title: "휴회" } : item;
  });
}

// 회고의 기존 시안 데이터는 유지하고, 프로젝트 카드는 API 응답만 사용한다.
const INITIAL_STORY_CARDS = MOCK_STORY_CARDS.filter((card) => card.type !== "project");

// 회고 시안 상태와 프로젝트 API 데이터를 기존 context에서 함께 제공한다.
export default function MockDataProvider({ children }) {
  const { user } = useAuth();
  return <MockDataState key={user?.id ?? "anonymous"} authenticatedUser={user}>{children}</MockDataState>;
}

function MockDataState({ authenticatedUser, children }) {
  const projectData = useProjectData(authenticatedUser);
  const [previewPart, setPreviewPart] = useState(null);
  const user = authenticatedUser
    ? { ...authenticatedUser, part: previewPart ?? AUTH_PART_LABELS[authenticatedUser.part] }
    : MOCK_USER;
  // 다른 화면으로 옮겨 가서 띄울 토스트다. 예: 프로젝트를 지우고 목록에서 안내(H-25).
  const [flashToast, setFlashToast] = useState(null);
  const [storyCards, setStoryCards] = useState(INITIAL_STORY_CARDS);
  const [weekStatus, setWeekStatus] = useState(MOCK_WEEK.status);

  // 사용자가 바뀌면(로그아웃·다른 계정) 데모 파트도 처음 값으로 돌린다.
  useEffect(() => () => setMockDemoPart(null), []);

  // 회고의 '데모 · 파트 바꿔 보기'(시연용)로 바뀐다. 상단 메뉴, 역량 태그 목록, 회고 화면이 모두 이 파트를 따른다.
  // 회고 mock API도 이 파트의 마감일로 응답한다. 실제 서비스에서는 가입 때 고른 파트로 고정된다(S-04).
  function setUserPart(part) {
    setMockDemoPart(Object.keys(AUTH_PART_LABELS).find((code) => AUTH_PART_LABELS[code] === part) ?? null);
    setPreviewPart(part);
  }

  function updateStoryCard(cardId, changes) {
    setStoryCards((current) => current.map((card) => card.id === cardId ? { ...card, ...changes } : card));
  }
  function deleteStoryCard(cardId) {
    setStoryCards((current) => current.filter((card) => card.id !== cardId));
  }
  function showFlashToast(message) {
    setFlashToast({ id: crypto.randomUUID(), message });
  }

  // 고쳐서 다시 저장해도 카드가 늘어나지 않도록 같은 카드는 바꿔 넣는다.
  function completeWeek(card) {
    if (getAuthMode() === "mock" && authenticatedUser) saveMockWeek(window.localStorage, authenticatedUser, card);
    setStoryCards((current) => [...current.filter(({ id }) => id !== card.id), card]);
    setWeekStatus("done");
  }

  function resetWeek() {
    if (getAuthMode() === "mock" && authenticatedUser) saveMockWeek(window.localStorage, authenticatedUser, null, MOCK_WEEK.week);
    setStoryCards((current) =>
      current.filter(({ week, type }) => week !== MOCK_WEEK.week || type === "project"),
    );
    setWeekStatus("idle");
  }

  return (
    <MockDataContext
      value={{
        user,
        setUserPart,
        competencies: getCompetencyNames(user.part),
        projects: projectData.projects,
        addProject: projectData.create,
        projectData,
        storyCards: [...storyCards.filter((card) => card.type !== "project"), ...projectData.cards],
        updateStoryCard,
        deleteStoryCard,
        flashToast,
        showFlashToast,
        hideFlashToast: () => setFlashToast(null),
        footprintWeeks: getFootprintWeeks(weekStatus, MOCK_PROJECTS, []),
        weekStatus,
        setWeekStatus,
        completeWeek,
        resetWeek,
      }}
    >
      {children}
    </MockDataContext>
  );
}

export function useMockData() {
  return use(MockDataContext);
}
