"use client";

import { createContext, use, useState } from "react";
import { getCompetencyNames } from "@/lib/mock/competencies";
import { FOOTPRINT_WEEKS } from "@/lib/mock/myRecord";
import { addMissingRecordCards, buildRecordCard } from "@/lib/mock/projectRecordCards";
import { MOCK_PROJECTS } from "@/lib/mock/projects";
import { MOCK_STORY_CARDS } from "@/lib/mock/storyCards";
import { MOCK_USER } from "@/lib/mock/user";
import { MOCK_WEEK } from "@/lib/mock/week";

const MockDataContext = createContext(null);

const CURRENT_WEEK_STICKER = { shape: "circle", color: "blue" };
const PROJECT_RECAP_STICKER = { shape: "sun", color: "yellow", isProjectRecap: true };

// 사자 발자국과 스티커 보드가 함께 쓰는 주차 목록이다.
// 이번 주 칸은 회고 상태에 따라, 프로젝트 회고 칸은 프로젝트를 완료하면 바뀐다.
function getFootprintWeeks(weekStatus, projects) {
  return FOOTPRINT_WEEKS.map((item) => {
    const doneProject = projects.find(
      ({ recap, status }) => status === "done" && recap?.week === item.week,
    );

    if (doneProject) {
      return {
        ...item,
        ...PROJECT_RECAP_STICKER,
        status: "done",
        title: doneProject.recap.title,
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

// 카드가 없는 목업 기록에도 카드를 만들어, 모든 프로젝트 기록이 카드 1장씩을 갖게 한다(H-22).
const INITIAL_STORY_CARDS = addMissingRecordCards(MOCK_STORY_CARDS, MOCK_PROJECTS);

// API가 없는 동안 화면끼리 공유하는 목업 데이터다. 페이지를 옮겨 다녀도 유지되고, 새로고침하면 처음 값으로 돌아간다.
// API를 연결할 때 이 안쪽을 실제 요청으로 바꾸면 화면 코드는 그대로 쓸 수 있다.
export default function MockDataProvider({ children }) {
  const [user, setUser] = useState(MOCK_USER);
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [storyCards, setStoryCards] = useState(INITIAL_STORY_CARDS);
  const [weekStatus, setWeekStatus] = useState(MOCK_WEEK.status);

  // 회고의 '데모 · 파트 바꿔 보기'(시연용)로 바뀐다. 상단 메뉴, 역량 태그 목록, 회고 화면이 모두 이 파트를 따른다.
  // 실제 서비스에서는 가입 때 고른 파트로 고정된다(S-04).
  function setUserPart(part) {
    setUser((current) => ({ ...current, part }));
  }

  function addProject(project) {
    setProjects((current) => [...current, project]);
  }

  function updateProject(projectId, update) {
    setProjects((current) =>
      current.map((project) => (project.id === projectId ? update(project) : project)),
    );
  }

  function updateStoryCard(cardId, changes) {
    setStoryCards((current) =>
      current.map((card) => (card.id === cardId ? { ...card, ...changes } : card)),
    );
  }

  function changeRecords(projectId, update) {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId ? { ...project, records: update(project.records) } : project,
      ),
    );
  }

  // 기록과 카드는 함께 생기고, 함께 바뀌고, 함께 지워진다(H-22, H-15).
  function addProjectRecord(projectId, record) {
    const project = projects.find(({ id }) => id === projectId);

    changeRecords(projectId, (records) => [record, ...records]);
    setStoryCards((current) => [...current, buildRecordCard(project, record)]);
  }

  function updateProjectRecord(projectId, recordId, changes) {
    const project = projects.find(({ id }) => id === projectId);
    const record = { ...project.records.find(({ id }) => id === recordId), ...changes };

    changeRecords(projectId, (records) =>
      records.map((item) => (item.id === recordId ? record : item)),
    );
    setStoryCards((current) =>
      current.map((card) =>
        card.recordId === recordId ? buildRecordCard(project, record, card) : card,
      ),
    );
  }

  function deleteProjectRecord(projectId, recordId) {
    changeRecords(projectId, (records) => records.filter(({ id }) => id !== recordId));
    setStoryCards((current) => current.filter((card) => card.recordId !== recordId));
  }

  // 카드를 고치면 카드만 바뀌지만(updateStoryCard), 프로젝트 카드를 지우면 그 기록도 함께 지운다(H-22).
  function deleteStoryCard(cardId) {
    const card = storyCards.find(({ id }) => id === cardId);

    setStoryCards((current) => current.filter(({ id }) => id !== cardId));
    if (card?.recordId) {
      changeRecords(card.projectId, (records) => records.filter(({ id }) => id !== card.recordId));
    }
  }

  // 고쳐서 다시 저장해도 카드가 늘어나지 않도록 같은 카드는 바꿔 넣는다.
  function completeWeek(card) {
    setStoryCards((current) => [...current.filter(({ id }) => id !== card.id), card]);
    setWeekStatus("done");
  }

  function resetWeek() {
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
        projects,
        addProject,
        updateProject,
        storyCards,
        updateStoryCard,
        deleteStoryCard,
        addProjectRecord,
        updateProjectRecord,
        deleteProjectRecord,
        footprintWeeks: getFootprintWeeks(weekStatus, projects),
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
