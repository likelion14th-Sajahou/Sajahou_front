// 실제로는 AI가 고른 기록과 답변으로 글을 쓴다. 목업에서는 기록과 답변을 시안의 틀에 그대로 넣어,
// 기록에 없는 성과가 만들어지지 않게 한다(H-16). 빈 항목은 채워 달라는 표시로 남긴다(H-18).
function missing(label) {
  return `⚑ (${label} 더해 주세요)`;
}

function bulletLines(lines, emptyLabel) {
  return lines.length > 0 ? lines.map((line) => `- ${line}`).join("\n") : missing(emptyLabel);
}

function joinSentences(sentences) {
  return sentences.map((sentence) => sentence.replace(/\.$/, "")).join(". ");
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
  const { status, role, startedAt, lastRecordedAt } = project;
  const results = [
    filled.result,
    ...records.map(({ result }) => result),
    filled.evidence && `숫자로 보면: ${filled.evidence}`,
  ].filter(Boolean);

  return [
    `# ${getProjectTitle(project)}`,
    `- 기간: ${startedAt} ~ ${status === "active" ? "진행 중" : lastRecordedAt}\n- 역할: ${role}`,
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

export function buildCardDraft(project, records, filled) {
  const problems = records.map(({ problem }) => problem).filter(Boolean);
  const actions = [filled.role, ...records.map(({ choice }) => choice)].filter(Boolean);
  const results = [filled.result, ...records.map(({ result }) => result)].filter(Boolean);

  return {
    situation: problems.length > 0
      ? `${getProjectTitle(project)}에서 ${problems.join(", ")}`
      : missing("상황을"),
    action: actions.length > 0 ? joinSentences(actions) : missing("행동을"),
    result: results.length > 0 ? joinSentences(results) : missing("결과를"),
  };
}

export function getEvidenceItems(records, attachmentCount) {
  return [
    ...records.map((record) => `${getRecordDate(record)} 기록 · ${record.did ?? ""}`),
    ...(attachmentCount > 0 ? [`산출물 ${attachmentCount}개`] : []),
  ];
}
