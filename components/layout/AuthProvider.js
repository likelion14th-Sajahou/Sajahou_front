"use client";

import { createContext, use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authRequest, getCurrentUser, getGoogleLoginDestination, logoutSession, validateUser } from "@/lib/auth";
import Button from "@/components/ui/Button";
import { AUTH_PART_LABELS } from "@/lib/authConfig";
import { checkWithdrawalSession, updateProfile, withdrawAccount } from "@/lib/profileApi";

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
  const [signupWelcome, setSignupWelcome] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const logoutInFlight = useRef(false);
  const profileMutation = useRef(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const generation = useRef(0);
  const welcomePending = useRef(false);
  const clearSignup = useCallback(() => {
    welcomePending.current = false;
    setSignup(null);
    setSignupWelcome(null);
  }, []);
  const clearNotice = useCallback(() => setNotice(""), []);
  const clearSignupWelcome = useCallback(() => setSignupWelcome(null), []);
  // 사용자 변경으로 하위 목 데이터가 초기화되어도 가입 완료 안내는 유지한다.
  const markSignupSubmitted = useCallback(() => {
    welcomePending.current = true;
    setSignup((current) => current ? { ...current, submitted: true } : null);
  }, []);

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

  const clearSession = useCallback((message = "") => {
    generation.current += 1;
    setSession(null);
    restoreRequest.current = null;
    setRestoreStatus("ready");
    setSignup(null);
    welcomePending.current = false;
    setSignupWelcome(null);
    setNotice(message);
    setLogoutError("");
    window.google?.accounts?.id?.disableAutoSelect();
    router.replace("/login");
  }, [router]);

  const cancelSignup = useCallback((message) => {
    generation.current += 1;
    setSignup(null);
    welcomePending.current = false;
    setSignupWelcome(null);
    setNotice(message);
    router.replace("/login");
  }, [router]);

  const logout = useCallback(async () => {
    if (logoutInFlight.current || profileMutation.current) return;
    logoutInFlight.current = true;
    setIsLoggingOut(true);
    setLogoutError("");
    const currentGeneration = generation.current;
    try {
      await logoutSession();
      if (generation.current === currentGeneration) clearSession();
    } catch (error) {
      if (generation.current !== currentGeneration) return;
      if (error.status === 401) {
        clearSession("로그인이 만료되었어요. 다시 로그인해 주세요.");
      } else {
        setLogoutError("로그아웃하지 못했어요. 다시 시도해 주세요.");
      }
    } finally {
      logoutInFlight.current = false;
      setIsLoggingOut(false);
    }
  }, [clearSession]);

  const completeLogin = useCallback(async ({ signal } = {}) => {
    const currentGeneration = ++generation.current;
    const user = validateUser(await getCurrentUser({ signal }));
    if (generation.current !== currentGeneration || signal?.aborted) return false;
    setSession({ user });
    if (welcomePending.current) {
      setSignupWelcome({ id: crypto.randomUUID(), message: `환영해요, ${user.name} 님! ${AUTH_PART_LABELS[user.part]} 파트로 시작해요` });
      welcomePending.current = false;
    }
    setSignup(null);
    setNotice("");
    return true;
  }, []);

  const acceptGoogleLogin = useCallback(async (result, options) => {
    const destination = getGoogleLoginDestination(result);
    if (destination === "/signup") {
      welcomePending.current = false;
      setSignupWelcome(null);
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
      if (error.status === 401 && !options.signal?.aborted && generation.current === currentGeneration) clearSession("로그인이 만료되었어요. 다시 로그인해 주세요.");
      throw error;
    }
  }, [session, clearSession]);

  const saveProfile = useCallback(async (changes, { signal } = {}) => {
    if (!session) throw new Error("로그인이 필요합니다.");
    if (logoutInFlight.current || profileMutation.current) throw new Error("진행 중인 계정 작업이 끝난 후 다시 시도해 주세요.");
    const mutation = { generation: generation.current };
    profileMutation.current = mutation;
    setIsSavingProfile(true);
    try {
      const result = await updateProfile(changes, { signal, request: authenticatedRequest });
      if (signal?.aborted || generation.current !== mutation.generation) throw new DOMException("로그인 상태가 변경되었거나 요청이 취소되었습니다.", "AbortError");
      const user = validateUser(result);
      if (user.id !== session.user.id) throw new Error("수정한 사용자 정보를 확인할 수 없습니다. 다시 로그인해 주세요.");
      // id를 유지하므로 MockDataProvider의 사용자별 기록은 초기화되지 않는다.
      setSession({ user });
      return user;
    } finally {
      if (profileMutation.current === mutation) profileMutation.current = null;
      setIsSavingProfile(false);
    }
  }, [session, authenticatedRequest]);

  const withdraw = useCallback(async (idToken, { signal } = {}) => {
    if (!session) throw new Error("로그인이 필요합니다.");
    if (logoutInFlight.current || profileMutation.current) throw new Error("진행 중인 계정 작업이 끝난 후 다시 시도해 주세요.");
    const mutation = { generation: generation.current };
    const ensureCurrentSession = () => {
      if (signal?.aborted || generation.current !== mutation.generation) throw new DOMException("로그인 상태가 변경되었거나 요청이 취소되었습니다.", "AbortError");
    };
    profileMutation.current = mutation;
    setIsWithdrawing(true);
    try {
      try {
        // authenticatedRequest는 모든 401에서 세션을 지우므로 탈퇴에는 사용하지 않는다.
        await withdrawAccount(idToken, { signal });
      } catch (error) {
        ensureCurrentSession();
        if (error.status === 401) {
          let currentUser;
          try {
            currentUser = await checkWithdrawalSession({ signal });
          } catch (cause) {
            ensureCurrentSession();
            throw new Error("로그인 상태를 다시 확인하지 못했어요. 잠시 후 다시 시도해 주세요.", { cause });
          }
          ensureCurrentSession();
          if (!currentUser) {
            clearSession("로그인이 만료되었어요. 다시 로그인해 주세요.");
          } else if (currentUser.id !== session.user.id) {
            clearSession("로그인한 계정이 변경되었어요. 다시 로그인해 주세요.");
          }
          // 세션이 유효하면 그대로 두고 원래 재인증 오류를 폼에 전달한다.
        }
        throw error;
      }
      ensureCurrentSession();
      clearSession("회원 탈퇴가 완료되었어요.");
    } finally {
      if (profileMutation.current === mutation) profileMutation.current = null;
      setIsWithdrawing(false);
    }
  }, [session, clearSession]);

  return (
    <AuthContext value={{ user: session?.user ?? null, isAuthenticated: Boolean(session), signup,
      notice, clearNotice, clearSignup, cancelSignup, markSignupSubmitted, acceptGoogleLogin, completeLogin,
      signupWelcome, clearSignupWelcome,
      authenticatedRequest, saveProfile, withdraw, isSavingProfile, isWithdrawing,
      isAccountBusy: isLoggingOut || isSavingProfile || isWithdrawing,
      logout, isLoggingOut, logoutError, restoreStatus, retryRestore }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  return use(AuthContext);
}

// 로그인 버튼 영역과 접근 제어 화면에서 같은 상태·재시도 UI를 사용한다.
export function AuthRestoreStatus({ className = "" }) {
  const { restoreStatus, retryRestore } = useAuth();
  if (restoreStatus === "ready") return null;

  return (
    <div className={`flex flex-col items-center justify-center gap-4 text-center ${className}`} aria-busy={restoreStatus === "checking"}>
      {restoreStatus === "checking" ? (
        <p role="status" className="text-body text-ink-subtle">로그인 상태를 확인하고 있어요…</p>
      ) : (
        <>
          <p role="alert" className="text-body text-ink">로그인 상태를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.</p>
          <Button onClick={retryRestore}>다시 시도</Button>
        </>
      )}
    </div>
  );
}
