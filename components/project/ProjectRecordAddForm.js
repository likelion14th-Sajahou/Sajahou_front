"use client";

import { useState } from "react";
import { useMockData } from "@/components/layout/MockDataProvider";
import { EMPTY_TAGS_MESSAGE } from "@/components/my-record/CompetencyTagPicker";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import { MOCK_RECORD_EXAMPLE } from "@/lib/mock/projects";
import ProjectRecordQuestions from "./ProjectRecordQuestions";
import ProjectRecordReview from "./ProjectRecordReview";
import RecordAttachmentsField from "./RecordAttachmentsField";
import RecordFieldsGrid from "./RecordFieldsGrid";
import RecordFormFooter from "./RecordFormFooter";
import RecordFormTitle from "./RecordFormTitle";
import { EMPTY_RECORD_MESSAGE } from "./recordFields";

// 한 일이 비면 카드 제목이 비지 않도록 메모 첫 줄을 쓰고, 메모도 없으면 이 문구를 쓴다.
const EMPTY_DID_TITLE = "(한 일 비어 있음)";

export default function ProjectRecordAddForm({ onCancel, onSave }) {
  const { competencies } = useMockData();
  const [attachments, setAttachments] = useState([]);
  const [memo, setMemo] = useState("");
  const [fields, setFields] = useState({});
  const [isWritingFields, setIsWritingFields] = useState(false);
  const [notice, setNotice] = useState("");
  const [step, setStep] = useState("materials");
  const [isOrganizedByAi, setIsOrganizedByAi] = useState(false);
  const [tags, setTags] = useState([]);
  const { toast, showToast, hideToast } = useToast();

  function getFieldValueProps(key) {
    return {
      value: fields[key] ?? "",
      onChange: (event) => {
        setFields((current) => ({ ...current, [key]: event.target.value }));
        setNotice("");
      },
    };
  }

  function getTrimmedFields() {
    return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value.trim()]));
  }

  // 5칸과 첨부가 모두 비어 있으면 정리 결과로 넘어가거나 저장하지 않는다(H-14). 메모는 저장되지 않는다.
  function hasRecordContent() {
    return attachments.length > 0 || Object.values(getTrimmedFields()).some(Boolean);
  }

  // 5칸을 직접 채운 경우에도 정리 결과 확인에서 역량 태그를 고른 뒤 저장한다(H-12).
  function organizeDirectly() {
    if (!hasRecordContent()) {
      showToast(EMPTY_RECORD_MESSAGE);
      return;
    }

    setIsOrganizedByAi(false);
    setStep("review");
  }

  function saveRecord() {
    if (!hasRecordContent()) {
      showToast(EMPTY_RECORD_MESSAGE);
      return;
    }

    if (tags.length === 0) {
      showToast(EMPTY_TAGS_MESSAGE);
      return;
    }

    const trimmedFields = getTrimmedFields();
    const memoFirstLine = memo.trim().split("\n")[0].trim();

    onSave({
      ...trimmedFields,
      did: trimmedFields.did || memoFirstLine || EMPTY_DID_TITLE,
      attachments,
      tags,
      organizedByAi: isOrganizedByAi,
    });
  }

  function fillExample() {
    setAttachments(MOCK_RECORD_EXAMPLE.attachments);
    setMemo(MOCK_RECORD_EXAMPLE.memo);
    setNotice("");
  }

  function startAiSummary() {
    // 첨부와 메모가 모두 비어 있으면 AI 정리로 넘어가지 않는다(H-12).
    if (attachments.length === 0 && !memo.trim()) {
      setNotice("자료를 첨부하거나 메모를 적어 주세요.");
      return;
    }

    setNotice("");
    setStep("questions");
  }

  // 실제로는 AI가 자료와 답변을 정리한다. 목업에서는 답변을 해당 칸에 그대로 넣는다.
  function showReview(answers) {
    setFields((current) => ({ ...current, ...answers }));
    setIsOrganizedByAi(true);
    setStep("review");
  }

  function returnToMaterials() {
    // 정리된 글이 보이지 않게 남아 있지 않도록, 내용이 있으면 5칸을 펼쳐 둔다.
    setIsWritingFields((current) => current || Object.values(fields).some((value) => value.trim()));
    setNotice("");
    setStep("materials");
  }

  return (
    <Card as="section" size="md" aria-labelledby="record-add-title">
      <div className="flex flex-col gap-4">
        <RecordFormTitle id="record-add-title">기록 추가</RecordFormTitle>
        {step === "questions" && (
          <ProjectRecordQuestions attachments={attachments} onComplete={showReview} />
        )}
        {step === "review" && (
          <ProjectRecordReview
            attachments={attachments}
            fields={fields}
            isOrganizedByAi={isOrganizedByAi}
            competencies={competencies}
            tags={tags}
            getFieldValueProps={getFieldValueProps}
            onChangeTags={setTags}
            onTagLimit={showToast}
            onBack={returnToMaterials}
            onSave={saveRecord}
          />
        )}
        {step === "materials" && (
          <div className="flex flex-col items-start gap-4">
            <div className="w-full">
              <RecordAttachmentsField
                label={
                  <>
                    자료 첨부 <span className="text-ink-subtle">· 선택 · 회의록, 발표 자료, 디자인 화면, 피그마 링크</span>
                  </>
                }
                attachments={attachments}
                onChange={(next) => {
                  setAttachments(next);
                  setNotice("");
                }}
              />
            </div>
            <TextField
              label={
                <>
                  짧은 메모 <span className="text-ink-subtle">· 대충 써도 돼요</span>
                </>
              }
              multiline
              rows={2}
              placeholder="예) 11/3 기획 회의. 홈 화면 구성 논의. 나는 시안 2개 준비"
              value={memo}
              onChange={(event) => {
                setMemo(event.target.value);
                setNotice("");
              }}
            />
            <TextLink onClick={() => setIsWritingFields((current) => !current)}>
              {isWritingFields ? "직접 쓰기 접기" : "5칸 직접 채우기"}
            </TextLink>
            {isWritingFields && (
              <RecordFieldsGrid
                getFieldProps={({ key, formLabel, placeholder }) => ({
                  label: (
                    <>
                      {formLabel} <span className="text-ink-subtle">· 선택</span>
                    </>
                  ),
                  placeholder,
                  ...getFieldValueProps(key),
                })}
              />
            )}
            {notice && <p role="alert" className="text-label text-tint-red-ink">{notice}</p>}
            <RecordFormFooter>
              <TextLink onClick={onCancel}>취소</TextLink>
              <TextLink onClick={fillExample}>예시 자료 넣기</TextLink>
              <div className="ml-auto flex gap-2">
                {isWritingFields && (
                  <Button variant="secondary" onClick={organizeDirectly}>이대로 정리 →</Button>
                )}
                <Button onClick={startAiSummary}>AI와 정리하기 →</Button>
              </div>
            </RecordFormFooter>
          </div>
        )}
      </div>
      <Toast toast={toast} onDismiss={hideToast} />
    </Card>
  );
}
