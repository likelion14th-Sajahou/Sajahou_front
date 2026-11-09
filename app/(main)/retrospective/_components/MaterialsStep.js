"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { MOCK_MATERIALS_CHANGED_PREVIEW } from "@/lib/mock/retrospective";
import { getRetrospective } from "@/lib/retrospectiveApi";
import MaterialsForm from "./MaterialsForm";
import { getRequestErrorMessage, useRetrospectivePreview } from "./RetrospectivePreview";

const ASSIGNMENT_STATUS = { RECORD: "record", LATER: "later", NONE: "none" };

// 파일 칩은 첨부 API(7~10번)를 연결할 때 attachments로 채운다. 지금은 화면에서만 유지한다.
function toFormMaterials(materials = {}) {
  return {
    hasPractice: materials.hasPractice ?? true,
    practice: materials.practiceContent ?? "",
    assignment: materials.assignmentContent ?? "",
    codeReview: materials.codeReview ?? "",
    memo: materials.memo ?? "",
    sessionFiles: [],
    practiceFiles: [],
    assignmentFiles: [],
  };
}

// 2단계 자료. 저장된 자료(API 13)를 불러와 폼에 채운다. 처음 시작했거나 처음부터를 눌렀으면 빈 폼이다.
// 과제 회고(회고 완료·과제 회고 분기에서 연결)와 화면 확인용 주소(?preview=materials-changed)는 API를 부르지 않는다.
export default function MaterialsStep({ preview }) {
  const router = useRouter();
  const { authenticatedRequest } = useAuth();
  const { session, isAssignment, setAssignmentStatus } = useRetrospectivePreview();
  const changePreview = preview === "materials-changed" ? MOCK_MATERIALS_CHANGED_PREVIEW : null;
  const usesApi = !isAssignment && !changePreview;
  const [loaded, setLoaded] = useState(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!usesApi) return;
    // 시작하지 않은 회고는 시작 화면에서 '시작하기'로 연다.
    if (!session.id) {
      router.replace("/retrospective");
      return;
    }
    const controller = new AbortController();
    getRetrospective(session.id, { signal: controller.signal, request: authenticatedRequest })
      .then((detail) => {
        setAssignmentStatus(ASSIGNMENT_STATUS[detail.materials.assignmentMode] ?? "record");
        setLoaded({ id: detail.id, materials: toFormMaterials(detail.materials) });
      })
      .catch((failure) => {
        if (controller.signal.aborted || failure.name === "AbortError" || failure.status === 401) return;
        setError(getRequestErrorMessage(failure, "작성한 자료를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."));
      });
    return () => controller.abort();
  }, [usesApi, session.id, authenticatedRequest, router, setAssignmentStatus, reloadKey]);

  if (!usesApi) {
    return (
      <MaterialsForm
        key={changePreview ? "materials-changed" : "materials"}
        initialMaterials={changePreview?.materials ?? toFormMaterials()}
        changePreview={changePreview}
      />
    );
  }

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
