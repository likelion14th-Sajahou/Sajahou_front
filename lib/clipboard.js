// 글을 클립보드에 복사한다. 브라우저가 권한을 막으면 false를 돌려준다.
// 안내 문구와 보여 주는 방식(토스트·화면 글자)은 쓰는 화면이 정한다.
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// 복사가 막혔을 때 공통 안내 문구다.
export const COPY_FAILED_MESSAGE = "복사하지 못했어요. 내용을 직접 선택해서 복사해 주세요.";
