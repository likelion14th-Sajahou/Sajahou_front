"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import TextField from "@/components/ui/TextField";
import LinkInputRow from "@/components/ui/LinkInputRow";
import TextLink from "@/components/ui/TextLink";
import MaterialAttachments from "./MaterialAttachments";
import MaterialsChangeNotice from "./MaterialsChangeNotice";
import { useRetrospectivePreview } from "./RetrospectivePreview";
import { SavedTime, useSaveLater } from "./useSaveLater";
import ActionFooter from "@/components/ui/ActionFooter";

const ACCEPTED_FILES = {
  sessionFiles: ".pdf",
  practiceFiles: ".zip,.png,.jpg,.jpeg,.webp,.gif",
  // 노션 ZIP·MD·PDF·이미지(R-11)
  assignmentFiles: ".zip,.md,.pdf,.png,.jpg,.jpeg,.webp,.gif",
};

// 노션에서 내보낸 ZIP·MD는 '노션 MD' 칩으로 보여 준다.
function getFileKind(fileName) {
  if (fileName.endsWith(".pdf")) return "pdf";
  if (fileName.endsWith(".zip") || fileName.endsWith(".md")) return "notion";
  return "image";
}

function MaterialSection({ title, titleId, controls, inactive = false, children }) {
  return (
    <section aria-labelledby={titleId} className={`flex min-w-0 flex-col gap-3 rounded-[20px] border border-line px-5 py-[18px] ${inactive ? "border-dashed bg-canvas" : ""}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h3 id={titleId} className="shrink-0 text-[16px]">{title}</h3>
        {controls}
      </div>
      {children}
    </section>
  );
}

export default function MaterialsForm({ initialMaterials, changePreview = null, canSave = true }) {
  const router = useRouter();
  const { part, assignmentStatus: sessionAssignmentStatus, setAssignmentStatus, isAssignment, getStepHref, deadlineLabels } = useRetrospectivePreview();
  const assignmentStatus = isAssignment ? "record" : sessionAssignmentStatus;
  // 입력 영역을 숨겨도(실습 없음, 과제 나중에) 작성한 내용은 유지한다.
  const [materials, setMaterials] = useState(initialMaterials);
  const { hasPractice } = materials;
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const [notice, setNotice] = useState("");
  const [isChangeNoticeOpen, setIsChangeNoticeOpen] = useState(Boolean(changePreview));
  const { save, isSaving, savedLabel } = useSaveLater({ canSave });

  // 지금은 단계(2)와 저장 시각만 저장한다(R-03). 자료 내용 저장은 회고 자료 입력 작업(FE-21)에서 더한다.
  async function saveLater() {
    const message = await save({ currentStep: 2 });
    if (message !== null) setNotice(message);
  }

  function requestQuestions() {
    if (changePreview) {
      setNotice("");
      setIsChangeNoticeOpen(true);
      return;
    }
    router.push(getStepHref("questions"));
  }

  function updateField(field, value) {
    setMaterials((previous) => ({ ...previous, [field]: value }));
  }

  function removeFile(field, id) {
    setMaterials((previous) => ({
      ...previous,
      [field]: previous[field].filter((file) => file.id !== id),
    }));
  }

  function selectFiles(field, files) {
    const extensions = ACCEPTED_FILES[field].split(",");
    const validFiles = files.filter((file) => extensions.some((extension) => file.name.toLowerCase().endsWith(extension)));
    const additions = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      kind: getFileKind(file.name.toLowerCase()),
    }));
    setMaterials((previous) => ({ ...previous, [field]: [...previous[field], ...additions] }));
    setNotice(validFiles.length !== files.length
      ? "지원하지 않는 파일 형식은 제외했어요. 업로드 버튼에 표시된 형식을 선택해주세요."
      : "파일을 선택했어요. 현재 화면에서만 유지되며 아직 업로드되지 않았어요.");
  }

  function addLink() {
    try {
      const url = new URL(link.trim());
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Invalid protocol");
      setMaterials((previous) => ({
        ...previous,
        assignmentFiles: [...previous.assignmentFiles, { id: crypto.randomUUID(), name: url.href, kind: "link" }],
      }));
      setLink("");
      setLinkError("");
    } catch {
      setLinkError("http:// 또는 https://로 시작하는 올바른 링크를 입력해주세요.");
    }
  }

  function attachments(field, uploadLabel, extra = {}) {
    return (
      <MaterialAttachments
        files={materials[field]}
        accept={ACCEPTED_FILES[field]}
        uploadLabel={uploadLabel}
        onRemove={(id) => removeFile(field, id)}
        onSelect={(files) => selectFiles(field, files)}
        {...extra}
      />
    );
  }

  return (
    <Card as="section" size="md" aria-labelledby="materials-title" className="flex min-w-0 flex-col gap-4">
      <div>
        <h2 id="materials-title" className="text-title tracking-[-0.02em]">자료 올리기</h2>
        <p className="text-label leading-[1.5] text-ink-subtle">모두 선택이에요. 있는 것만 올려요.</p>
      </div>

      {/* 과제 회고는 같은 5단계지만 자료 단계에는 과제 칸만 있다(R-23). */}
      {!isAssignment && (
        <>
          <MaterialSection title="세션 자료" titleId="session-materials-title" controls={<Badge>PDF</Badge>}>
            {attachments("sessionFiles", "+ 세션 PDF")}
          </MaterialSection>

          <MaterialSection title="세션 중 실습이 있었나요?" titleId="practice-title" inactive={!hasPractice} controls={
            <div className="ml-auto flex max-w-full flex-wrap gap-1.5" role="group" aria-labelledby="practice-title">
              {["있었어요", "없었어요"].map((label, index) => (
                <Chip key={label} size="sm" selected={hasPractice === (index === 0)} onClick={() => updateField("hasPractice", index === 0)}>{label}</Chip>
              ))}
            </div>
          }>
            {hasPractice ? (
              <>
                <TextField label="실습 내용 · 무엇을 배웠는지 적어보세요" multiline name="practice" value={materials.practice} onChange={(event) => updateField("practice", event.target.value)} className="h-[98px]" />
                {attachments("practiceFiles", "+ 노션 ZIP · 캡처")}
              </>
            ) : (
              <p className="text-body-sm break-keep text-ink-subtle">실습 질문은 건너뛰고 세션 내용만 물어볼게요.</p>
            )}
          </MaterialSection>
        </>
      )}

      <MaterialSection title="이번 주 과제는요?" titleId="assignment-title" inactive={assignmentStatus !== "record"} controls={!isAssignment && (
        <div className="ml-auto flex max-w-full flex-wrap gap-1.5" role="group" aria-labelledby="assignment-title">
          {[
            { value: "record", label: "과제 기록하기" },
            { value: "later", label: "나중에 쓸게요" },
            { value: "none", label: "과제 없음" },
          ].map(({ value, label }) => (
            <Chip key={value} size="sm" selected={assignmentStatus === value} onClick={() => setAssignmentStatus(value)}>{label}</Chip>
          ))}
        </div>
      )}>
        {assignmentStatus === "record" ? (
          <>
            <TextField label="과제 내용 · 코드나 에러 · 붙여넣기" multiline name="assignment" value={materials.assignment} onChange={(event) => updateField("assignment", event.target.value)} className="h-[130px] text-[13px] leading-[1.6]" />
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="text-label text-ink-muted">과제 노션이나 Git을 올려보세요</p>
              {attachments("assignmentFiles", "+ 파일 업로드", {
                uploadOnNewLine: true,
                children: (
                  <LinkInputRow
                    className="w-full sm:w-auto"
                    name="assignmentLink"
                    aria-label="Git 링크"
                    placeholder={part === "기획·디자인" ? "피그마·GitHub 링크" : "GitHub 링크 · github.com/아이디/저장소"}
                    aria-invalid={Boolean(linkError)}
                    aria-describedby={linkError ? "assignment-link-error" : undefined}
                    value={link}
                    onChange={(value) => { setLink(value); setLinkError(""); }}
                    onAdd={addLink}
                  />
                ),
              })}
              {linkError && <p id="assignment-link-error" role="alert" className="text-label text-tint-red-ink">{linkError}</p>}
            </div>
            {part === "프론트엔드" && (
              <TextField
                label="받은 코드리뷰 · 짝이 남긴 코멘트 3개"
                multiline
                rows={7}
                name="codeReview"
                value={materials.codeReview}
                onChange={(event) => updateField("codeReview", event.target.value)}
                className="min-h-[194px] max-[359px]:min-h-[266px] max-sm:resize-y min-[640px]:h-[98px] min-[640px]:min-h-0 min-[901px]:h-[146px] min-[1101px]:h-[98px]"
              />
            )}
          </>
        ) : (
          <p className="text-body-sm break-keep text-ink-subtle">
            {assignmentStatus === "later"
              ? `과제는 ${deadlineLabels.assignment}까지 따로 써요. 세션 회고만 먼저 끝내요.`
              : "이번 주 과제는 없어요."}
          </p>
        )}
      </MaterialSection>

      {!isAssignment && (
        <TextField label="고민 메모 · 선택" multiline name="memo" value={materials.memo} onChange={(event) => updateField("memo", event.target.value)} placeholder="예) 공식 문서도 찾아봤는데 아직 헷갈림" className="h-[74px]" />
      )}
      <MaterialsChangeNotice
        open={isChangeNoticeOpen}
        answerCount={changePreview?.answerCount ?? 0}
        onCancel={() => { setIsChangeNoticeOpen(false); setNotice(""); }}
        onContinue={() => setNotice("이전 질문 이어 쓰기는 준비 중이에요.")}
        onRegenerate={() => setNotice("질문 새로 만들기는 준비 중이에요. 기존 답변은 삭제하지 않았어요.")}
      />
      <ActionFooter className="flex-wrap justify-between gap-x-3.5 gap-y-2.5">
        <TextLink href={getStepHref()}>← 이전</TextLink>
        {/* 저장 시각이 버튼을 오른쪽으로 밀어 준다. 좁은 화면에서는 버튼이 다음 줄로 내려간다. */}
        <SavedTime label={savedLabel} className="ml-auto" />
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Button variant="secondary" className="min-w-0 max-[389px]:px-2 max-[389px]:text-label" onClick={saveLater} disabled={isSaving} aria-busy={isSaving}>{isSaving ? "저장하는 중…" : "나중에 이어쓰기"}</Button>
          <Button className="min-w-0 max-[389px]:px-2 max-[389px]:text-label" onClick={requestQuestions}>AI 질문 받기 →</Button>
        </div>
      </ActionFooter>
      <p role="status" className={notice ? "-mt-1 text-body-sm text-ink-muted" : "sr-only"}>{notice}</p>
    </Card>
  );
}
