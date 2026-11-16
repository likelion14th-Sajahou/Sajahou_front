// 프로젝트 기록 1개 = 프로젝트 카드 1장(H-22). 목업 카드의 '기록 전문'을 만드는 규칙이다.
// 실제 서비스에서는 서버가 기록을 저장하면서 카드를 만든다.

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
