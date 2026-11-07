import { formatRoles } from "./projectRoles";

// 실제로는 AI가 고른 기록과 답변으로 글을 쓴다. 목업에서는 기록과 답변을 시안의 틀에 그대로 넣어,
// 기록에 없는 성과가 만들어지지 않게 한다(H-16). 빈 항목은 채워 달라는 표시로 남긴다(H-18).
function missing(label) {
  return `⚑ (${label} 더해 주세요)`;
}

function bulletLines(lines, emptyLabel) {
  return lines.length > 0 ? lines.map((line) => `- ${line}`).join("\n") : missing(emptyLabel);
}


// 새로 만든 프로젝트는 부제가 없다.
function getProjectTitle({ name, subtitle }) {
  return subtitle ? `${name} · ${subtitle}` : name;
}

function getRecordDate({ date, weekday }) {
  return `${date}(${weekday})`;
}

function getProblemLine({ problem, choice }) {
  return [problem && `문제: ${problem}`, choice && `선택: ${choice}`].filter(Boolean).join(" → ");
}

function getArtifactLine({ kind, name }) {
  return kind === "link" ? `https://${name}` : name;
}

export function getPortfolioAttachments(records, filled) {
  return [...records.flatMap(({ attachments }) => attachments), ...(filled.artifacts ?? [])];
}

export function buildPortfolioMarkdown(project, records, filled) {
  const { status, roles, startedAt, endedAt } = project;
  const results = [
    filled.result,
    ...records.map(({ result }) => result),
    filled.evidence && `숫자로 보면: ${filled.evidence}`,
  ].filter(Boolean);

  return [
    `# ${getProjectTitle(project)}`,
    // 진행 중이면 '진행 중'으로 보여 주고, 저장할 때 마친 날로 바꾼다.
    `- 기간: ${startedAt} ~ ${status === "active" ? "진행 중" : endedAt}\n- 역할: ${formatRoles(roles)}`,
    `## 내 역할\n${filled.role ?? missing("내 역할을")}`,
    `## 주요 기여\n${bulletLines(
      records.filter(({ did }) => did).map((record) => `${getRecordDate(record)} ${record.did}`),
      "주요 기여를",
    )}`,
    `## 문제와 해결\n${bulletLines(records.map(getProblemLine).filter(Boolean), "문제와 해결을")}`,
    `## 결과\n${bulletLines(results, "결과를")}`,
    `## 산출물\n${bulletLines(getPortfolioAttachments(records, filled).map(getArtifactLine), "산출물을")}`,
    `## 배운 점\n${filled.learned ?? missing("배운 점을")}`,
  ].join("\n\n");
}
