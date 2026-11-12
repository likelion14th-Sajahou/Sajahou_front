import assert from "node:assert/strict";
import test from "node:test";
import { competenciesFor, emptyState } from "./projectModel.js";
import { mentionsCompetency } from "./matchingKeywords.js";
import { createMockServerFetch, MOCK_STORAGE_PREFIX } from "./server.js";

test("프론트엔드 목록은 새 순서로 표시하되 기존 ID와 다른 파트 목록을 유지한다", () => {
  const tags = competenciesFor("FRONTEND");
  assert.deepEqual(tags.slice(0, 8).map(({ id, name }) => [id, name]), [
    [23, "개념 이해"], [16, "화면 구현"], [17, "상태 관리"], [18, "API 연동"],
    [19, "성능 최적화"], [20, "반응형·접근성"], [21, "UX 개선"], [22, "코드 품질 및 유지보수"],
  ]);
  for (const part of ["PLAN_DESIGN", "FRONTEND", "BACKEND"]) {
    assert.equal(competenciesFor(part).length, 15);
    assert.equal(new Set(competenciesFor(part).map(({ id }) => id)).size, 15);
  }
  assert.equal(competenciesFor("BACKEND").find(({ id }) => id === 30).name, "코드 품질");
  assert.ok(mentionsCompetency("사용자 경험 개선", "UX 개선"));
  assert.ok(mentionsCompetency("유지보수와 코드 리뷰", "코드 품질 및 유지보수"));
  assert.ok(mentionsCompetency("코드 리뷰", "코드 품질"));
});

test("이전 저장소의 카드·기록·매칭 이름을 옮기고 조회·필터·재저장 ID를 보존한다", async () => {
  const key = `${MOCK_STORAGE_PREFIX}101`;
  const oldTags = [{ id: 21, name: "사용자 경험 개선" }, { id: 22, name: "코드 품질" }];
  const state = { ...emptyState(), myRecordSeeded: true, completedWeeks: [],
    cards: { 42: { cardId: 42, type: "SESSION", status: "PUBLISHED", weekNumber: 1,
      title: "기존 카드", competencies: structuredClone(oldTags), evidenceSummary: [], fullMarkdown: "사용자 원문 코드 품질" } },
    records: { 43: { status: "SAVED", competencies: structuredClone(oldTags) } },
    jobPostings: { 44: { competencies: [{ competencyId: 21, name: "사용자 경험 개선" }] } },
    coverLetterQuestions: { 45: { answer: { missingCompetencies: [{ competencyId: 22, name: "코드 품질" }] } } },
  };
  const values = new Map([[key, JSON.stringify(state)]]);
  const storage = { getItem: (k) => values.get(k) ?? null, setItem: (k, v) => values.set(k, v) };
  const fetch = createMockServerFetch({ storage, getUser: async () => ({ id: 101, part: "FRONTEND" }) });
  const request = async (path, body) => {
    const response = await fetch(`https://mock.test/api/v1${path}`, body ? { method: "PATCH", body: JSON.stringify(body) } : {});
    assert.equal(response.status, 200);
    return (await response.json()).data;
  };
  const tags = await request("/competencies");
  assert.equal(tags.find(({ id }) => id === 21).cardCount, 1);
  assert.equal((await request("/story-cards?competencyId=21&q=UX")).totalCount, 1);
  const card = await request("/story-cards/42", { competencyIds: [22] });
  assert.deepEqual(card.competencies, [{ id: 22, name: "코드 품질 및 유지보수" }]);
  const saved = JSON.parse(values.get(key));
  assert.deepEqual(saved.records[43].competencies.map(({ name }) => name), ["UX 개선", "코드 품질 및 유지보수"]);
  assert.equal(saved.jobPostings[44].competencies[0].name, "UX 개선");
  assert.equal(saved.coverLetterQuestions[45].answer.missingCompetencies[0].name, "코드 품질 및 유지보수");
  assert.equal(saved.cards[42].fullMarkdown, "사용자 원문 코드 품질");
});
