// 요청 실패 안내 문구다. 회고·자소서 매칭 화면이 함께 쓴다.

// 연결 문제(시간 초과·네트워크)와 그 밖의 실패만 나눈다.
export function getRequestErrorMessage(failure, fallback) {
  return failure?.kind === "timeout" || failure?.kind === "network"
    ? "연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요."
    : fallback;
}

// 첨부를 아직 읽는 중(409 ATTACHMENT_PENDING)일 때의 안내다. 요청 전에 읽는 중인 첨부를 미리 막을 때도 쓴다.
export const ATTACHMENT_PENDING_MESSAGE = "첨부를 아직 읽고 있어요. 잠시 후 다시 시도해 주세요.";

const AI_ERROR_MESSAGES = {
  AI_TIMEOUT: "AI 응답이 너무 오래 걸렸어요. 다시 시도해 주세요.",
  AI_FAILED: "AI가 응답하지 못했어요. 다시 시도해 주세요.",
  AI_IN_PROGRESS: "AI가 만들고 있어요. 잠시 후 다시 시도해 주세요.",
  ATTACHMENT_PENDING: ATTACHMENT_PENDING_MESSAGE,
};

// AI를 부르는 요청(질문 받기, 초안 만들기, 공고 역량 찾기)의 실패 안내다.
export function getAiErrorMessage(failure, fallback) {
  if (failure.kind === "timeout") return AI_ERROR_MESSAGES.AI_TIMEOUT;
  return AI_ERROR_MESSAGES[failure.code] ?? getRequestErrorMessage(failure, fallback);
}
