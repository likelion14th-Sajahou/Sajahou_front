import { MOCK_WEEK } from "./week.js";

// 프로젝트 기록 1개 = 프로젝트 카드 1장(H-22). 기록에서 카드를 만드는 규칙이다.
// 실제 서비스에서는 서버가 기록을 저장하면서 카드를 만들 것이므로, API 명세가 정해지면 이 계산은 응답으로 대체한다.

export function getRecordCardId(recordId) {
  return `card-${recordId}`;
}

// 기록 날짜가 속한 주차다. 목업 날짜만 다루는 프로토타입 규칙을 따른다(5/19 → 12주차, 5/26 → 13주차, 10월 이후 → 이번 주).
function getRecordWeek(date) {
  const [month, day] = date.split("/").map(Number);
  const monthDay = month * 100 + day;

  if (monthDay >= 1000) return MOCK_WEEK.week;
  if (monthDay >= 526) return 13;
  if (monthDay >= 519) return 12;
  return 11;
}

function buildEvidence({ date, weekday, attachments }) {
  const attachmentText = attachments.length > 0 ? ` · 첨부 ${attachments.length}개` : "";

  return `${date}(${weekday}) 프로젝트 기록${attachmentText}`;
}

// 카드 팝업의 '기록 전문'(A-10)이다. 노션에 붙여 넣는 Markdown 원문이고, 빈 결과·배운 점은 채울 자리를 남긴다.
export function buildRecordDocument({ title, whenLabel, summary }) {
  const lines = [`# ${title}`, "", `- 시기: ${whenLabel}`, ""];
  const sections = [
    ["상황", summary.situation],
    ["내가 한 일", summary.action],
    ["그렇게 한 이유", summary.reason],
  ];

  sections.forEach(([heading, text]) => {
    if (text) lines.push(`## ${heading}`, text, "");
  });
  lines.push(
    "## 결과",
    summary.result || "(결과를 더해 주세요)",
    "",
    "## 배운 점",
    summary.learned || "(한 줄 남겨 주세요)",
  );

  return lines.join("\n");
}

// 기록이 바뀌면 카드의 상황·행동·이유·결과·태그·근거를 기록에 맞추고, 제목과 배운 점은 카드에 있던 값을 지킨다(H-15).
export function buildRecordCard(project, record, card) {
  const summary = {
    situation: record.problem ?? "",
    action: record.did ?? "",
    reason: record.choice ?? "",
    result: record.result ?? "",
    learned: card?.summary.learned ?? "",
  };
  const nextCard = {
    id: getRecordCardId(record.id),
    week: getRecordWeek(record.date),
    type: "project",
    whenLabel: project.name,
    shape: "sunFine",
    color: "yellow",
    ...card,
    projectId: project.id,
    recordId: record.id,
    title: card?.title ?? record.did,
    tags: record.tags,
    evidence: buildEvidence(record),
    summary,
  };

  return { ...nextCard, document: buildRecordDocument(nextCard) };
}

// 처음 목업에서 카드가 없는 기록에는 카드를 만들어 붙인다.
export function addMissingRecordCards(cards, projects) {
  const cardsByRecordId = new Set(cards.map(({ recordId }) => recordId).filter(Boolean));
  const missingCards = projects.flatMap((project) =>
    project.records
      .filter(({ id }) => !cardsByRecordId.has(id))
      .map((record) => buildRecordCard(project, record)),
  );

  return [...cards, ...missingCards];
}
