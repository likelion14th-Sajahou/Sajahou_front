"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

let initializedClientId;
let credentialCallback;

export default function GoogleSignInButton({ disabled, onCredential, onError }) {
  const containerRef = useRef(null);
  const [scriptState, setScriptState] = useState("loading");
  const ready = scriptState === "ready";
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!ready || !clientId) return;
    const container = containerRef.current;
    const googleId = window.google?.accounts?.id;
    if (!container || !googleId) {
      onError("Google 로그인 화면을 불러오지 못했어요. 페이지를 새로고침해 주세요.");
      return;
    }

    const receiveCredential = (response) => {
      if (!response?.credential) {
        onError("Google 인증에 실패했어요. 다시 시도해 주세요.");
        return;
      }
      onCredential(response.credential);
    };
    credentialCallback = receiveCredential;

    try {
      // GIS는 페이지에서 한 번 초기화하고, 재진입 시 현재 콜백만 교체한다.
      if (initializedClientId !== clientId) {
        googleId.initialize({
          client_id: clientId,
          ux_mode: "popup",
          auto_select: false,
          callback: (response) => credentialCallback?.(response),
        });
        initializedClientId = clientId;
      }
      let renderedWidth;
      const render = () => {
        const width = Math.max(200, Math.min(400, Math.floor(container.clientWidth)));
        if (width === renderedWidth) return;
        renderedWidth = width;
        container.replaceChildren();
        googleId.renderButton(container, {
          type: "standard", theme: "outline", size: "large", text: "continue_with",
          shape: "pill", locale: "ko", width,
        });
      };
      render();
      const observer = new ResizeObserver(render);
      observer.observe(container);
      return () => {
        observer.disconnect();
        container.replaceChildren();
        if (credentialCallback === receiveCredential) credentialCallback = null;
      };
    } catch {
      if (credentialCallback === receiveCredential) credentialCallback = null;
      onError("Google 로그인 화면을 불러오지 못했어요. 페이지를 새로고침해 주세요.");
    }
  }, [ready, clientId, onCredential, onError]);

  if (!clientId) {
    return <p role="alert" className="text-label text-error">Google 로그인을 준비 중이에요. 잠시 후 다시 이용해 주세요.</p>;
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptState("ready")}
        onError={() => {
          setScriptState("error");
          onError("Google에 연결할 수 없어요. 네트워크를 확인하고 새로고침해 주세요.");
        }}
      />
      <div className="flex min-h-10 w-full justify-center" inert={disabled} aria-disabled={disabled || undefined}>
        <div ref={containerRef} className={`flex w-full justify-center ${disabled ? "opacity-60" : ""}`} />
      </div>
      {scriptState === "loading" && <p role="status" className="text-label text-ink-subtle">Google 로그인 불러오는 중…</p>}
    </>
  );
}
