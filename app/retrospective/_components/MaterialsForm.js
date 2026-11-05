"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import MaterialAttachments from "./MaterialAttachments";

const ACCEPTED_FILES = {
  sessionFiles: ".pdf",
  practiceFiles: ".zip,.png,.jpg,.jpeg,.webp,.gif",
  assignmentFiles: ".zip,.pdf,.png,.jpg,.jpeg,.webp,.gif",
};

function MaterialSection({ title, titleId, controls, children }) {
  return (
    <section aria-labelledby={titleId} className="flex min-w-0 flex-col gap-3 rounded-[20px] border border-line px-5 py-[18px]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h3 id={titleId} className="shrink-0 text-[16px]">{title}</h3>
        {controls}
      </div>
      {children}
    </section>
  );
}

export default function MaterialsForm({ initialMaterials }) {
  const [materials, setMaterials] = useState(initialMaterials);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const [notice, setNotice] = useState("");

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
      kind: file.name.toLowerCase().endsWith(".pdf") ? "pdf" : file.name.toLowerCase().endsWith(".zip") ? "notion" : "image",
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

      <MaterialSection title="세션 자료" titleId="session-materials-title" controls={<Badge>PDF</Badge>}>
        {attachments("sessionFiles", "+ 세션 PDF")}
      </MaterialSection>

      <MaterialSection title="세션 중 실습이 있었나요?" titleId="practice-title" controls={
        <div className="ml-auto flex max-w-full flex-wrap gap-1.5" role="group" aria-labelledby="practice-title">
          {["있었어요", "없었어요"].map((label, index) => (
            <Chip key={label} size="sm" selected={index === 0} disabled title="실습 여부 전환은 다음 작업에서 연결할 예정입니다." className="disabled:cursor-default">{label}</Chip>
          ))}
        </div>
      }>
        <TextField label="실습 내용 · 무엇을 배웠는지 적어보세요" multiline name="practice" value={materials.practice} onChange={(event) => updateField("practice", event.target.value)} className="h-[98px]" />
        {attachments("practiceFiles", "+ 노션 ZIP · 캡처")}
      </MaterialSection>

      <MaterialSection title="이번 주 과제는요?" titleId="assignment-title" controls={
        <div className="ml-auto flex max-w-full flex-wrap gap-1.5" role="group" aria-labelledby="assignment-title">
          {["과제 기록하기", "나중에 쓸게요", "과제 없음"].map((label, index) => (
            <Chip key={label} size="sm" selected={index === 0} disabled title="과제 상태 전환은 다음 작업에서 연결할 예정입니다." className="disabled:cursor-default">{label}</Chip>
          ))}
        </div>
      }>
        <TextField label="과제 내용 · 코드나 에러 · 붙여넣기" multiline name="assignment" value={materials.assignment} onChange={(event) => updateField("assignment", event.target.value)} className="h-[130px] text-[13px] leading-[1.6]" />
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-label text-ink-muted">과제 노션이나 Git을 올려보세요</p>
          {attachments("assignmentFiles", "+ 파일 업로드", {
            uploadOnNewLine: true,
            children: (
              <div className="flex w-full min-w-0 gap-1.5 sm:w-auto sm:flex-1">
                <TextField size="sm" className="min-w-0" name="assignmentLink" aria-label="Git 링크" placeholder="피그마·GitHub 링크" value={link} aria-invalid={Boolean(linkError)} aria-describedby={linkError ? "assignment-link-error" : undefined} onChange={(event) => { setLink(event.target.value); setLinkError(""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addLink(); } }} />
                <Button variant="secondary" size="sm" onClick={addLink}>추가</Button>
              </div>
            ),
          })}
          {linkError && <p id="assignment-link-error" role="alert" className="text-label text-tint-red-ink">{linkError}</p>}
        </div>
      </MaterialSection>

      <TextField label="고민 메모 · 선택" multiline name="memo" placeholder="예) 공식 문서도 찾아봤는데 아직 헷갈림" className="h-[74px]" />
      <div className="pt-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3.5 gap-y-2.5 border-t border-line pt-4">
          <TextLink href="/retrospective">← 이전</TextLink>
          <div className="ml-auto grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
            <Button variant="secondary" className="min-w-0 max-[389px]:px-2 max-[389px]:text-label" onClick={() => setNotice("임시 저장은 준비 중이에요. 화면을 벗어나면 입력한 내용이 사라져요.")}>나중에 이어쓰기</Button>
            <Button className="min-w-0 max-[389px]:px-2 max-[389px]:text-label" onClick={() => setNotice("AI 질문 받기는 준비 중이에요. 입력한 내용은 현재 화면에서만 유지돼요.")}>AI 질문 받기 →</Button>
          </div>
        </div>
        <p role="status" className={notice ? "mt-3 text-body-sm text-ink-muted" : "sr-only"}>{notice}</p>
      </div>
    </Card>
  );
}
