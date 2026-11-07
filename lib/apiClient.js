export class ApiError extends Error {
  constructor(message, {
    kind, status = null, code = null, payload = null, rawBody = null, cause,
  } = {}) {
    super(message, { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.error = payload?.error ?? null;
    this.code = this.error?.code ?? code;
    this.fields = this.error?.fields;
    this.detail = this.error?.detail;
    this.isValidationError = this.code === "VALIDATION_ERROR";
    this.payload = payload;
    this.rawBody = rawBody;
  }
}

async function readResponse(response, method) {
  if (response.ok && (response.status === 204 || method === "HEAD")) return undefined;

  const rawBody = await response.text();
  let payload = null;
  let parseError;
  if (rawBody.trim()) {
    try {
      payload = JSON.parse(rawBody);
    } catch (cause) {
      parseError = cause;
    }
  }

  const context = { status: response.status, payload, rawBody };
  // 오류 본문이 JSON이 아니어도 HTTP 상태를 잃지 않는다.
  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload?.error?.message || `API 요청 실패 (HTTP ${response.status})`, {
      ...context,
      kind: response.ok ? "business" : "http",
      code: response.ok ? "BUSINESS_ERROR" : "HTTP_ERROR",
      cause: parseError,
    });
  }
  if (parseError) {
    throw new ApiError("API 응답의 JSON을 읽을 수 없습니다.", {
      ...context, kind: "parse", code: "INVALID_JSON", cause: parseError,
    });
  }
  if (!rawBody.trim()) return undefined;
  if (payload?.success !== true || !Object.hasOwn(payload, "data")) {
    throw new ApiError("API 공통 응답 형식이 올바르지 않습니다.", {
      ...context, kind: "response", code: "INVALID_RESPONSE",
    });
  }
  return payload.data;
}

export async function apiRequest(path, {
  method = "GET", query, body, headers: requestHeaders, token,
  timeoutMs, signal, ...fetchOptions
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

  const normalizedMethod = method.toUpperCase();
  if (timeoutMs !== undefined &&
      (!Number.isInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > 2147483647)) {
    throw new RangeError("timeoutMs는 1~2147483647 사이의 정수(ms)여야 합니다.");
  }

  const timeoutController = timeoutMs === undefined ? null : new AbortController();
  const timeoutReason = new Error("API request timeout");
  const requestSignal = timeoutController
    ? (signal ? AbortSignal.any([signal, timeoutController.signal]) : timeoutController.signal)
    : signal;
  const timer = timeoutController
    ? setTimeout(() => timeoutController.abort(timeoutReason), timeoutMs)
    : undefined;

  let response;
  try {
    requestSignal?.throwIfAborted();
    response = await fetch(url, {
      ...fetchOptions,
      method: normalizedMethod,
      headers,
      body: requestBody,
      ...(requestSignal ? { signal: requestSignal } : {}),
    });
    // 응답 본문을 읽는 동안에도 타임아웃을 유지한다.
    return await readResponse(response, normalizedMethod);
  } catch (cause) {
    if (!requestSignal?.aborted && cause instanceof ApiError) throw cause;

    const aborted = requestSignal?.aborted;
    const timedOut = aborted && requestSignal.reason === timeoutReason;
    throw new ApiError(
      timedOut ? "API 요청 시간이 초과되었습니다."
        : aborted ? "API 요청이 취소되었습니다." : "API 네트워크 요청에 실패했습니다.",
      {
        kind: timedOut ? "timeout" : aborted ? "aborted" : "network",
        code: timedOut ? "TIMEOUT" : aborted ? "ABORTED" : "NETWORK_ERROR",
        status: response?.status ?? null,
        cause,
      },
    );
  } finally {
    clearTimeout(timer);
  }
}
