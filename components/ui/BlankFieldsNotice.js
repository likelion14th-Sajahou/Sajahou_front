// 기록에서 찾지 못한 내용 안내(⚑). 프로젝트·회고의 빈칸 안내와 자료 부족 안내가 같은 디자인을 쓴다.
// labels는 기존 빈칸 문구, children은 자료 부족 등 별도 안내 문구에 쓴다.
// id: 칸 바로 아래에 붙일 때 그 칸의 aria-describedby로 이어 준다(회고 검토).
// tone: info(노랑, 기본) · bad(주황, 자료를 읽지 못함) · wait(회색, 기다리는 중). wait는 ⏳를 붙인다.
const TONES = {
  info: "bg-tint-yellow text-tint-yellow-ink",
  bad: "bg-[#fff0e8] text-[#b03a00]",
  wait: "bg-[#eef0f3] text-[#4a5260]",
};

export default function BlankFieldsNotice({ id, tone = "info", labels = [], children }) {
  if (labels.length === 0 && !children) {
    return null;
  }

  return (
    <p id={id} className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-label leading-[20.8px] ${TONES[tone]}`}>
      <span aria-hidden="true">{tone === "wait" ? "⏳" : "⚑"}</span>
      {children ?? `${labels.join(", ")}은(는) 기록에서 찾지 못해 비워 뒀어요.`}
    </p>
  );
}
