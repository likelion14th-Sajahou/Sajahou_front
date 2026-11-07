"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import MaterialAttachments from "./MaterialAttachments";
import MaterialsChangeNotice from "./MaterialsChangeNotice";
import { useRetrospectivePreview } from "./RetrospectivePreview";

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

export default function MaterialsForm({ initialMaterialsByPart, assignmentDueLabel, changePreview = null }) {
  const router = useRouter();
  const { part, assignmentStatus: sessionAssignmentStatus, setAssignmentStatus, isAssignment, getStepHref } = useRetrospectivePreview();
  const assignmentStatus = isAssignment ? "record" : sessionAssignmentStatus;
  const [drafts, setDrafts] = useState(initialMaterialsByPart);
  const materials = drafts[part];
  const [hasPractice, setHasPractice] = useState(true);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const [notice, setNotice] = useState("");
  const [isChangeNoticeOpen, setIsChangeNoticeOpen] = useState(Boolean(changePreview));

  function requestQuestions() {
    if (changePreview) {
      setNotice("");
      setIsChangeNoticeOpen(true);
      return;
    }
    router.push(getStepHref("questions"));
  }

  // 파트를 바꾸거나 입력 영역을 숨겨도 각 파트에서 작성한 내용은 유지한다.
  function setMaterials(update) {
    setDrafts((previous) => ({ ...previous, [part]: update(previous[part]) }));
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
                <Chip key={label} size="sm" selected={hasPractice === (index === 0)} onClick={() => setHasPractice(index === 0)}>{label}</Chip>
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
                  <div className="flex w-full min-w-0 gap-1.5 sm:w-auto sm:flex-1">
                    <TextField size="sm" className="min-w-0" name="assignmentLink" aria-label="Git 링크" placeholder={part === "기획·디자인" ? "피그마·GitHub 링크" : "GitHub 링크 · github.com/아이디/저장소"} value={link} aria-invalid={Boolean(linkError)} aria-describedby={linkError ? "assignment-link-error" : undefined} onChange={(event) => { setLink(event.target.value); setLinkError(""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addLink(); } }} />
                    <Button variant="secondary" size="sm" onClick={addLink}>추가</Button>
                  </div>
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
              ? `과제는 ${assignmentDueLabel}까지 따로 써요. 세션 회고만 먼저 끝내요.`
              : "이번 주 과제는 없어요."}
          </p>
        )}
      </MaterialSection>

      {!isAssignment && (
        <TextField label="고민 메모 · 선택" multiline name="memo" placeholder="예) 공식 문서도 찾아봤는데 아직 헷갈림" className="h-[74px]" />
      )}
      <MaterialsChangeNotice
        open={isChangeNoticeOpen}
        answerCount={changePreview?.answerCount ?? 0}
        onCancel={() => { setIsChangeNoticeOpen(false); setNotice(""); }}
        onContinue={() => setNotice("이전 질문 이어 쓰기는 준비 중이에요.")}
        onRegenerate={() => setNotice("질문 새로 만들기는 준비 중이에요. 기존 답변은 삭제하지 않았어요.")}
      />
      <div className="pt-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3.5 gap-y-2.5 border-t border-line pt-4">
          <TextLink href={getStepHref()}>← 이전</TextLink>
          <div className="ml-auto grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
            <Button variant="secondary" className="min-w-0 max-[389px]:px-2 max-[389px]:text-label" onClick={() => setNotice("임시 저장은 준비 중이에요. 화면을 벗어나면 입력한 내용이 사라져요.")}>나중에 이어쓰기</Button>
            <Button className="min-w-0 max-[389px]:px-2 max-[389px]:text-label" onClick={requestQuestions}>AI 질문 받기 →</Button>
          </div>
        </div>
        <p role="status" className={notice ? "mt-3 text-body-sm text-ink-muted" : "sr-only"}>{notice}</p>
      </div>
    </Card>
  );
}
