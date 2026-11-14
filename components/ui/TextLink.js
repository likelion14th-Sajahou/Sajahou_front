import Link from "next/link";

// link: 디자인 시스템(Figma 'Text Link'). 회색 삼립호빵체 + 아래 테두리선. 기본 모양이다.
// underline: 헤더의 로그아웃처럼 본문 글꼴에 밑줄만 긋는 링크.
const VARIANT_CLASSES = {
  link: "border-b border-ink-500 font-display leading-5 text-ink-500",
  underline:
    "px-0.5 py-1 text-ink-subtle underline decoration-from-font [text-underline-position:from-font]",
  // 진한 카드(회고 시작 카드) 위의 흰 밑줄 링크
  inverse:
    "py-1 font-display leading-[22.4px] text-white underline decoration-from-font [text-underline-position:from-font]",
  // 진한 카드 하단의 '← 이전'(회고 자료): 흰 삼립호빵체 + 흰 아래 테두리선
  "inverse-border": "border-b border-white font-display leading-[22.4px] text-white",
  // 연한 상자 안의 '취소'(회고 자료 확인 문구): 진한 삼립호빵체 + 밑줄
  "ink-underline":
    "py-1 font-display leading-[22.4px] text-ink underline decoration-from-font [text-underline-position:from-font]",
  // 홈의 '사자 발자국 →'(Figma '텍스트 링크'): 진한 Bold 글씨 + 아래 테두리선
  border: "border-b border-ink font-bold leading-[20.8px] text-ink",
  accent:
    "text-accent-strong underline decoration-from-font [text-underline-position:from-font]",
  // 내 정보 수정의 '회원 탈퇴'(Figma 11/15): 빨간 삼립호빵체 + 빨간 아래 테두리선(link와 같은 모양)
  "danger-link": "border-b border-[#d64545] font-display leading-5 text-[#d64545]",
  danger:
    "px-0.5 py-1 text-danger underline decoration-from-font [text-underline-position:from-font]",
};

const SIZE_CLASSES = {
  md: "text-body-sm",
  sm: "text-label",
};

export default function TextLink({
  variant = "link",
  size = "md",
  href,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  const classes = `inline-block shrink-0 cursor-pointer whitespace-nowrap ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
