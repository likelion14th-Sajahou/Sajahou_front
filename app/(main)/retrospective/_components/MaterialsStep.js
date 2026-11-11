"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getRetrospective } from "@/lib/retrospectiveApi";
import MaterialsForm from "./MaterialsForm";
import { useRetrospectivePreview } from "./RetrospectivePreview";
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

// 2단계 자료. 저장된 자료(API 13)를 불러와 폼에 채운다. 처음 시작했거나 처음부터를 눌렀으면 빈 폼이다.
// 과제 회고(R-23)도 같은 자료 단계를 쓰고, 화면에는 과제 칸만 보인다.
export default function MaterialsStep() {
  const router = useRouter();
  const { authenticatedRequest } = useAuth();
  const { retrospective, isAssignment, getStepHref, setAssignmentStatus } = useRetrospectivePreview();
  const retrospectiveId = retrospective?.id;
  const startHref = getStepHref();
  const [loaded, setLoaded] = useState(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // 시작하지 않은 회고는 시작 화면에서 '시작하기'로 연다.
    if (!retrospectiveId) {
      router.replace(startHref);
      return;
    }
    const controller = new AbortController();
    getRetrospective(retrospectiveId, { signal: controller.signal, request: authenticatedRequest })
      .then((detail) => {
        // 과제 작성 방식은 세션 회고에만 있다.
        if (!isAssignment) setAssignmentStatus(ASSIGNMENT_STATUS[detail.materials.assignmentMode] ?? "record");
        setLoaded({ id: detail.id, materials: toFormMaterials(detail.materials, detail.attachments) });
      })
      .catch((failure) => {
        if (controller.signal.aborted || failure.name === "AbortError" || failure.status === 401) return;
        setError(getRequestErrorMessage(failure, "작성한 자료를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."));
      });
    return () => controller.abort();
  }, [retrospectiveId, isAssignment, startHref, authenticatedRequest, router, setAssignmentStatus, reloadKey]);

  if (!loaded) {
    return (
      <Card as="section" size="md" className="flex flex-wrap items-center gap-3">
        {error ? (
          <>
            <p role="alert" className="text-body-sm text-error">{error}</p>
            <Button size="sm" variant="secondary" onClick={() => { setError(""); setReloadKey((key) => key + 1); }}>다시 시도</Button>
          </>
        ) : (
          <p role="status" className="text-body-sm text-ink-muted">작성한 자료를 불러오는 중이에요.</p>
        )}
      </Card>
    );
  }

  return <MaterialsForm key={loaded.id} initialMaterials={loaded.materials} />;
}
