// 도메인 mock이 함께 쓰는 응답 형식이다. 명세의 success / data / error 형식을 따른다.
export function success(data, status = 200) {
  return status === 204 ? new Response(null, { status })
    : Response.json({ success: true, data, error: null }, { status });
}

export function failure(status, code, message, fields) {
  return Response.json({ success: false, data: null,
    error: { code, message, ...(fields ? { fields } : {}) } }, { status });
}
