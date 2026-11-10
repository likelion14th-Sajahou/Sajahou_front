// 도메인 mock이 함께 쓰는 응답 형식이다. 명세의 success / data / error 형식을 따른다.
export function success(data, status = 200) {
  return status === 204 ? new Response(null, { status })
    : Response.json({ success: true, data, error: null }, { status });
}

export function failure(status, code, message, fields) {
  return Response.json({ success: false, data: null,
    error: { code, message, ...(fields ? { fields } : {}) } }, { status });
}

export const invalid = (fields) => failure(400, "VALIDATION_ERROR", "입력값을 확인해 주세요.", fields);
export const notFound = () => failure(404, "NOT_FOUND", "대상을 찾을 수 없습니다.");

// 지연·실패를 API body나 사용자 입력에 섞지 않는다. 테스트 또는 mock 전용 설정에서 주입한다.
// 요청을 취소하면 기다리던 것을 멈추고 취소 이유로 실패한다.
export function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const cleanup = () => signal?.removeEventListener("abort", abort);
    const timer = setTimeout(() => { cleanup(); resolve(); }, ms);
    function abort() { clearTimeout(timer); cleanup(); reject(signal.reason); }
    signal?.addEventListener("abort", abort, { once: true });
  });
}
