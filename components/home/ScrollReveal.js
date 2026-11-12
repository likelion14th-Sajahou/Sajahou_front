"use client";

import { useEffect, useRef } from "react";

// 보드 전체와 최근 회고 전체에 같은 진입 규칙을 적용한다.
// JS 미지원·움직임 줄이기 환경에서는 콘텐츠를 처음부터 표시한다.
export default function ScrollReveal({ as: Component = "div", className = "", children }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    let observer;

    function configure() {
      observer?.disconnect();
      delete element.dataset.reveal;
      if (!motion.matches || !("IntersectionObserver" in window)) return;
      element.dataset.reveal = "hidden";

      observer = new IntersectionObserver(([entry]) => {
        if (element.contains(document.activeElement)) return;
        if (entry.intersectionRatio >= 0.2) element.dataset.reveal = "visible";
        else if (!entry.isIntersecting) element.dataset.reveal = "hidden";
      }, { threshold: [0, 0.2] });
      observer.observe(element);
    }

    configure();
    motion.addEventListener("change", configure);
    return () => {
      observer?.disconnect();
      motion.removeEventListener("change", configure);
      delete element.dataset.reveal;
    };
  }, []);

  return (
    <Component ref={ref} className={`home-reveal ${className}`} onFocusCapture={() => {
      if (ref.current.dataset.reveal) ref.current.dataset.reveal = "visible";
    }}>
      {children}
    </Component>
  );
}
