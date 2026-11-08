"use client";

import { createContext, use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authRequest, getCurrentUser, getGoogleLoginDestination, validateUser } from "@/lib/auth";
import Button from "@/components/ui/Button";

const AuthContext = createContext(null);
const SIGNUP_LIFETIME_MS = 10 * 60 * 1000;

export default function AuthProvider({ children }) {
  const router = useRouter();
  // 세션 쿠키는 브라우저가 관리하고, 프론트에는 조회한 사용자 정보만 둔다.
  const [session, setSession] = useState(null);
  const [restoreStatus, setRestoreStatus] = useState("checking");
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const restoreRequest = useRef(null);
  const [signup, setSignup] = useState(null);
  const [notice, setNotice] = useState("");
  const generation = useRef(0);
  const clearSignup = useCallback(() => setSignup(null), []);
  const clearNotice = useCallback(() => setNotice(""), []);

  useEffect(() => {
    let active = true;
    const currentGeneration = generation.current;
    // Strict Mode의 effect 재실행에서도 진행 중인 최초 조회를 공유한다.
    const request = restoreRequest.current ??= getCurrentUser();
    request.then((result) => {
      if (!active || generation.current !== currentGeneration) return;
      setSession({ user: validateUser(result) });
      setRestoreStatus("ready");
    }).catch((error) => {
      if (!active || generation.current !== currentGeneration) return;
      if (error.status === 401) {
        setSession(null);
        setRestoreStatus("ready");
      } else {
        setRestoreStatus("error");
      }
    });
    return () => { active = false; };
  }, [restoreAttempt]);

  const retryRestore = () => {
    restoreRequest.current = null;
    setRestoreStatus("checking");
    setRestoreAttempt((attempt) => attempt + 1);
  };

  const logout = useCallback((message = "") => {
    generation.current += 1;
    setSession(null);
    setSignup(null);
    setNotice(message);
    window.google?.accounts?.id?.disableAutoSelect();
    router.replace("/login");
  }, [router]);

  const completeLogin = useCallback(async ({ signal } = {}) => {
    const currentGeneration = ++generation.current;
    const user = validateUser(await getCurrentUser({ signal }));
    if (generation.current !== currentGeneration || signal?.aborted) return false;
    setSession({ user });
    setSignup(null);
    setNotice("");
    return true;
  }, []);

  const acceptGoogleLogin = useCallback(async (result, options) => {
    const destination = getGoogleLoginDestination(result);
    if (destination === "/signup") {
      generation.current += 1;
      setSession(null);
      setSignup({ signupToken: result.signupToken, email: result.email,
        suggestedName: result.suggestedName ?? "", expiresAt: Date.now() + SIGNUP_LIFETIME_MS });
      setNotice("");
    } else if (!await completeLogin(options)) return null;
    return destination;
  }, [completeLogin]);

  const authenticatedRequest = useCallback(async (path, options = {}) => {
    if (!session) throw new Error("로그인이 필요합니다.");
    const currentGeneration = generation.current;
    try {
      const result = await authRequest(path, options);
      if (currentGeneration !== generation.current) throw new DOMException("로그인 상태가 변경되었습니다.", "AbortError");
      return result;
    } catch (error) {
      if (error.status === 401 && generation.current === currentGeneration) logout("로그인이 만료되었어요. 다시 로그인해 주세요.");
      throw error;
    }
  }, [session, logout]);

  return (
    <AuthContext value={{ user: session?.user ?? null, isAuthenticated: Boolean(session), signup,
      notice, clearNotice, clearSignup, acceptGoogleLogin, completeLogin, authenticatedRequest, logout }}>
      {restoreStatus === "ready" ? children : (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
          {restoreStatus === "checking" ? (
            <p role="status" className="text-body text-ink-subtle">로그인 상태를 확인하고 있어요…</p>
          ) : (
            <>
              <p role="alert" className="text-body text-ink">로그인 상태를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.</p>
              <Button onClick={retryRestore}>다시 시도</Button>
            </>
          )}
        </div>
      )}
    </AuthContext>
  );
}

export function useAuth() {
  return use(AuthContext);
}
