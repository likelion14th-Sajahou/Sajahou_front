export async function apiRequest(path, { method = "GET", ...fetchOptions } = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
  if (!baseUrl) {
    throw new TypeError("NEXT_PUBLIC_API_BASE_URL을 설정해 주세요.");
  }

  const apiBaseUrl = baseUrl.endsWith("/api/v1") ? baseUrl : `${baseUrl}/api/v1`;
  const url = `${apiBaseUrl}/${path.replace(/^\/+/, "")}`;

  // Step 1에서는 원본 Response를 반환하고 요청별 fetch 옵션을 그대로 전달한다.
  return fetch(url, { ...fetchOptions, method: method.toUpperCase() });
}
