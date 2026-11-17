import Header from "@/components/layout/Header";

// 상단 메뉴가 있는 서비스 화면들의 레이아웃이다.
// 로그인·회원가입(S-01~S-05)처럼 메뉴가 없는 화면은 이 그룹 밖(app/(auth))에 둔다. 괄호 폴더는 주소에 나타나지 않는다.
// 인증 가드는 각 화면의 개인 콘텐츠에 배치해 페이지와 기본 UI의 렌더링을 막지 않는다.
export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
