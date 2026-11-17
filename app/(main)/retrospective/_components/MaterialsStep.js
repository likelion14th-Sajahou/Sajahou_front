"use client";

import { useCallback } from "react";
import { getRetrospective } from "@/lib/retrospectiveApi";
import MaterialsForm from "./MaterialsForm";
import { useRetrospective } from "./RetrospectiveProvider";
import StepLoadCard from "./StepLoadCard";
import useStepData from "./useStepData";
import { splitAttachments } from "./useMaterialAttachments";
import { getRequestErrorMessage } from "@/lib/requestErrorMessage";

const ASSIGNMENT_STATUS = { RECORD: "record", LATER: "later", NONE: "none" };

// 저장된 자료와 첨부(13번)를 폼 값으로 바꾼다. 첨부는 종류(category)에 따라 세션·실습·과제 칸으로 나눈다.
function toFormMaterials(materials = {}, attachments = []) {
  return {
    hasPractice: materials.hasPractice ?? true,
    practice: materials.practiceContent ?? "",
    assignment: materials.assignmentContent ?? "",
    codeReview: materials.codeReview ?? "",
    memo: materials.memo ?? "",
    ...splitAttachments(attachments),
  };
}

const toErrorMessage = (failure) => getRequestErrorMessage(failure, "작성한 자료를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");

// 2단계 자료. 저장된 자료(API 13)를 불러와 폼에 채운다. 처음 시작했거나 처음부터를 눌렀으면 빈 폼이다.
// 과제 회고(R-23)도 같은 자료 단계를 쓰고, 화면에는 과제 칸만 보인다.
export default function MaterialsStep() {
  const { isAssignment, setAssignmentStatus } = useRetrospective();
  const load = useCallback(async (retrospectiveId, options) => {
    const detail = await getRetrospective(retrospectiveId, options);
    // 과제 작성 방식은 세션 회고에만 있다.
    if (!isAssignment) setAssignmentStatus(ASSIGNMENT_STATUS[detail.materials.assignmentMode] ?? "record");
    return { id: detail.id, materials: toFormMaterials(detail.materials, detail.attachments) };
  }, [isAssignment, setAssignmentStatus]);
  const { data, error, retry } = useStepData(load, toErrorMessage);

  if (!data) return <StepLoadCard error={error} onRetry={retry}>작성한 자료를 불러오는 중이에요.</StepLoadCard>;
  return <MaterialsForm key={data.id} initialMaterials={data.materials} />;
}
