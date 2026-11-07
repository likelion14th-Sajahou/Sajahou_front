export async function apiRequest(path, {
  method = "GET", query, body, headers: requestHeaders, token, ...fetchOptions
} = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
  if (!baseUrl) {
    throw new TypeError("NEXT_PUBLIC_API_BASE_URL을 설정해 주세요.");
  }

  const apiBaseUrl = baseUrl.endsWith("/api/v1") ? baseUrl : `${baseUrl}/api/v1`;
  const url = new URL(`${apiBaseUrl}/${path.replace(/^\/+/, "")}`);

  if (query instanceof URLSearchParams) {
    query.forEach((value, key) => url.searchParams.append(key, value));
  } else {
    for (const [key, value] of Object.entries(query ?? {})) {
      for (const item of Array.isArray(value) ? value : [value]) {
        if (item !== undefined && item !== null) url.searchParams.append(key, item);
      }
    }
  }

  const headers = new Headers({ Accept: "application/json" });
  new Headers(requestHeaders).forEach((value, key) => headers.set(key, value));
  // 토큰은 해당 요청에서만 사용하고 저장하거나 자동으로 조회하지 않는다.
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let requestBody;
  if (body instanceof FormData) {
    headers.delete("Content-Type");
    requestBody = body;
  } else if (body !== undefined) {
    requestBody = JSON.stringify(body);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  }

  // 공통 응답 처리는 Step 3에서 추가하며, 현재는 원본 Response를 반환한다.
  return fetch(url, {
    ...fetchOptions,
    method: method.toUpperCase(),
    headers,
    body: requestBody,
  });
}
