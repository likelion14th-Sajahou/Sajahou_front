// AI를 기다리는 동안의 안내다(FE-32). 회고·프로젝트·자소서 매칭이 같은 형식을 쓴다.
// AI 응답은 최대 50초쯤 걸려서(API 명세 공통) 시간은 '1분 정도'로 단정하지 않고 알린다.
// doing은 'AI가' 다음에 올 말이다. 예: aiWaitingMessage("자료를 읽고 질문을 만들고 있어요")
export function aiWaitingMessage(doing) {
  return `AI가 ${doing}. 1분 정도 걸릴 수 있어요.`;
}

// 화면 읽기 프로그램이 바뀐 내용을 읽도록 영역은 늘 두고, 기다리는 동안에만 글자를 보여 준다.
export default function AiWaitingNotice({ active, doing, className = "" }) {
  return (
    <p role="status" className={active ? `text-label text-ink-subtle ${className}` : "sr-only"}>
      {active ? aiWaitingMessage(doing) : ""}
    </p>
  );
}
