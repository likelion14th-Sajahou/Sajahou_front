"use client";

import { useEffect } from "react";

// 흰자 중심과 원본 검은자 중심. 좌표는 516 × 392 원본 캐릭터 기준이다.
const EYE_CENTERS = [
  { white: [216.27, 191.58], pupil: [222.16, 191.7] },
  { white: [282.31, 192.16], pupil: [288.28, 192.56] },
];

export default function useHeroGaze(characterRef, ctaRef) {
  useEffect(() => {
    const character = characterRef.current;
    const pupils = [...character.querySelectorAll("[data-pupil]")];
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)");
    const positions = EYE_CENTERS.map(() => ({ x: 0, y: 0, targetX: 0, targetY: 0 }));
    let frame = null;
    let pointer = null;

    function animate() {
      frame = null;
      let moving = false;
      positions.forEach((position, index) => {
        position.x += (position.targetX - position.x) * 0.14;
        position.y += (position.targetY - position.y) * 0.14;
        if (Math.hypot(position.targetX - position.x, position.targetY - position.y) > 0.01) moving = true;
        else { position.x = position.targetX; position.y = position.targetY; }
        pupils[index].style.translate = `${position.x}px ${position.y}px`;
      });
      if (moving) frame = requestAnimationFrame(animate);
    }

    function update() {
      if (!motion.matches || document.hidden) return;
      const bounds = character.getBoundingClientRect();
      const cta = ctaRef.current.getBoundingClientRect();
      const atCta = pointer && pointer.x >= cta.left && pointer.x <= cta.right && pointer.y >= cta.top && pointer.y <= cta.bottom;
      const follow = pointer && !atCta && bounds.bottom > 0 && bounds.top < window.innerHeight;
      const scale = bounds.width / 516;

      positions.forEach((position, index) => {
        const { white, pupil } = EYE_CENTERS[index];
        if (!follow) { position.targetX = 0; position.targetY = 0; return; }
        const dx = pointer.x - (bounds.left + white[0] * scale);
        const dy = pointer.y - (bounds.top + white[1] * scale);
        const distance = Math.hypot(dx, dy);
        const reach = Math.min(distance / (bounds.width / 2), 1) * 11 * scale;
        position.targetX = (white[0] - pupil[0]) * scale + (distance ? dx / distance * reach : 0);
        position.targetY = (white[1] - pupil[1]) * scale + (distance ? dy / distance * reach : 0);
      });
      const moving = positions.some(({ x, y, targetX, targetY }) => Math.hypot(targetX - x, targetY - y) > 0.01);
      if (moving && frame === null) frame = requestAnimationFrame(animate);
    }

    function move(event) {
      if (event.pointerType !== "mouse") return;
      pointer = { x: event.clientX, y: event.clientY };
      update();
    }

    function reset() { pointer = null; update(); }
    function leave(event) { if (!event.relatedTarget) reset(); }
    function configure() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      pointer = null;
      positions.forEach((position, index) => {
        position.x = position.y = position.targetX = position.targetY = 0;
        pupils[index].style.removeProperty("translate");
      });
    }

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leave);
    window.addEventListener("blur", reset);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    document.addEventListener("visibilitychange", configure);
    motion.addEventListener("change", configure);
    return () => {
      configure();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", reset);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.removeEventListener("visibilitychange", configure);
      motion.removeEventListener("change", configure);
    };
  }, [characterRef, ctaRef]);
}
