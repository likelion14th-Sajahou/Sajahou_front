"use client";

import { createContext, use, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authRequest, getCurrentUser, getGoogleLoginDestination, validateUser } from "@/lib/auth";

const AuthContext = createContext(null);
const SIGNUP_LIFETIME_MS = 10 * 60 * 1000;

export default function AuthProvider({ children }) {
  const router = useRouter();
  // 보관 정책 확정 전에는 메모리만 사용한다. 새로고침하면 다시 로그인한다.
  const [session, setSession] = useState(null);
  const [signup, setSignup] = useState(null);
  const [notice, setNotice] = useState("");
  const generation = useRef(0);
  const clearSignup = useCallback(() => setSignup(null), []);
  const clearNotice = useCallback(() => setNotice(""), []);

  const logout = useCallback((message = "") => {
    generation.current += 1;
    setSession(null);
    setSignup(null);
    setNotice(message);
    window.google?.accounts?.id?.disableAutoSelect();
    router.replace("/login");
  }, [router]);

  const completeLogin = useCallback(async (result, { signal } = {}) => {
    if (!result?.accessToken) throw new Error("로그인 응답을 확인할 수 없습니다.");
    validateUser(result.user);
    const currentGeneration = ++generation.current;
    const user = validateUser(await getCurrentUser(result.accessToken, { signal }));
    if (generation.current !== currentGeneration || signal?.aborted) return false;
    setSession({ accessToken: result.accessToken, user });
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
    } else if (!await completeLogin(result, options)) return null;
    return destination;
  }, [completeLogin]);

  const authenticatedRequest = useCallback(async (path, options = {}) => {
    if (!session) throw new Error("로그인이 필요합니다.");
    const currentGeneration = generation.current;
    try {
      const result = await authRequest(path, { ...options, token: session.accessToken });
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
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  return use(AuthContext);
}
