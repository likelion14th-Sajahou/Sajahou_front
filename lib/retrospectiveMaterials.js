export const EMPTY_RETROSPECTIVE_MATERIALS_MESSAGE = "자료를 업로드하거나 메모를 남겨 주세요";

// R-14: 현재 회고에서 활성화된 자료만 검사한다. 숨긴 입력값·첨부 자체는 지우지 않는다.
// FAILED·SKIPPED도 '첨부 있음'이다. 읽을 수 있는 자료 부족은 별도의 AI 응답으로 처리한다.
export function hasRetrospectiveMaterials(materials, { isAssignment = false, isFrontend = false, assignmentStatus = "record" } = {}) {
  const hasText = (value) => Boolean(value?.trim());
  const hasFiles = (items) => Boolean(items?.length);

  if (!isAssignment && (
    hasFiles(materials.sessionFiles)
    || hasText(materials.memo)
    || (materials.hasPractice && (hasText(materials.practice) || hasFiles(materials.practiceFiles)))
  )) return true;

  return (isAssignment || assignmentStatus === "record") && (
    hasText(materials.assignment)
    || hasFiles(materials.assignmentFiles)
    || (isFrontend && hasText(materials.codeReview))
  );
}
