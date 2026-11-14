// 로그인·회원가입 화면 틀(Figma '[디] 00 시작'): 진한 배경 가운데에 연회색 테두리 틀을 두른 카드.
// 틀 안에 무엇을 두는지(로그인: 캐릭터 + 흰 패널, 회원가입: 흰 패널)는 화면마다 children으로 정한다.
// align: 카드를 화면 가운데(로그인) 또는 위쪽(입력이 긴 회원가입)에 둔다. frameClassName으로 카드 폭·배치를 정한다.
export default function AuthScreen({ align = "center", frameClassName = "", children }) {
  return (
    <main className={`flex min-h-svh justify-center bg-ink-900 px-4 py-12 ${align === "center" ? "items-center" : "items-start"}`}>
      <div className={`w-full rounded-[28px] bg-divider p-2 shadow-[0_8px_24px_rgba(0,0,0,0.06)] ${frameClassName}`}>
        {children}
      </div>
    </main>
  );
}
