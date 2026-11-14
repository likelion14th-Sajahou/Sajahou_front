"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import FormDialog, { FormDialogActions } from "@/components/ui/FormDialog";
import MarkedSection from "@/components/ui/MarkedSection";
import TextLink from "@/components/ui/TextLink";
import { AUTH_PART_LABELS } from "@/lib/authConfig";
import { createProfileValues, toProfilePayload, validateProfile } from "@/lib/profile";
import ProfileFields from "./ProfileFields";
import WithdrawAccountModal from "./WithdrawAccountModal";

const TITLE_ID = "profile-title";

// 내 정보 수정 팝업(S-06, Figma '[디] 01-d', 11/14 추가). 상단 메뉴의 이름(모바일은 '내 정보')을 누르면 열린다.
// 입력칸(ProfileFields)과 검사 규칙은 회원가입과 같이 쓰고, 겉 틀은 새 프로젝트 팝업과 같은 FormDialog다.
// onSaved(message): 저장하면 팝업을 닫고 연 쪽에서 토스트를 띄운다.
export default function ProfileModal({ onClose, onSaved }) {
  const { user, isAccountBusy } = useAuth();
  if (!user) return null;

  return (
    <FormDialog
      open
      onClose={onClose}
      busy={isAccountBusy}
      showClose
      titleId={TITLE_ID}
      icon={<Image src="/images/brand/logo.png" alt="" width={117} height={42} />}
      title="내 정보 수정"
      description="이름·학번·학과·기수를 바꿀 수 있어요."
    >
      {/* 계정이 바뀌면 입력 중인 값도 처음부터 다시 채운다. */}
      <ProfileForm key={user.id} user={user} onClose={onClose} onSaved={onSaved} />
    </FormDialog>
  );
}

function ProfileForm({ user, onClose, onSaved }) {
  const { saveProfile, isSavingProfile, isAccountBusy, logout, isLoggingOut, logoutError } = useAuth();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [values, setValues] = useState(() => createProfileValues(user));
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const formRef = useRef(null);
  const focusErrors = useRef(false);
  const requestInFlight = useRef(false);
  const controllerRef = useRef(null);
  const withdrawButtonRef = useRef(null);
  const wasWithdrawOpen = useRef(false);
  const payload = toProfilePayload(values);
  const changes = Object.fromEntries(Object.entries(payload).filter(([field, value]) => value !== user[field]));
  const hasChanges = Object.keys(changes).length > 0;

  useEffect(() => () => controllerRef.current?.abort(), []);

  useEffect(() => {
    if (wasWithdrawOpen.current && !withdrawOpen) withdrawButtonRef.current?.focus();
    wasWithdrawOpen.current = withdrawOpen;
  }, [withdrawOpen]);

  useEffect(() => {
    if (!focusErrors.current) return;
    focusErrors.current = false;
    const firstInvalid = Array.from(formRef.current?.elements ?? []).find((element) => {
      const errorName = element.name === "otherDepartment" ? "department" : element.name;
      return errors[errorName] && !(element.name === "department" && values.department === "other");
    });
    firstInvalid?.focus();
  }, [errors, values.department]);

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: name === "cohort" ? Number(value) : value };
    setValues(nextValues);
    setRequestError("");
    const errorName = name === "otherDepartment" ? "department" : name;
    if (errors[errorName]) {
      const nextError = validateProfile(nextValues)[errorName];
      setErrors((previous) => {
        const next = { ...previous };
        if (nextError) next[errorName] = nextError;
        else delete next[errorName];
        return next;
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (requestInFlight.current || isAccountBusy) return;
    const nextErrors = validateProfile(values);
    focusErrors.current = true;
    setErrors(nextErrors);
    setRequestError("");
    if (Object.keys(nextErrors).length || !hasChanges) return;

    requestInFlight.current = true;
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      await saveProfile(changes, { signal: controller.signal });
      if (controller.signal.aborted) return;
      onSaved?.("내 정보를 저장했어요");
      onClose();
    } catch (failure) {
      if (controller.signal.aborted || failure.name === "AbortError" || failure.status === 401) return;
      if (failure.isValidationError) {
        const fieldErrors = {};
        for (const field of ["name", "studentNo", "department", "cohort"]) {
          if (typeof failure.fields?.[field] === "string") fieldErrors[field] = failure.fields[field];
        }
        focusErrors.current = true;
        setErrors(fieldErrors);
        setRequestError(failure.message);
      } else {
        setRequestError(failure.kind === "timeout"
          ? "저장 결과를 확인하지 못했어요. 잠시 후 다시 확인해 주세요."
          : "내 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      requestInFlight.current = false;
    }
  }

  return (
    <>
      <form ref={formRef} noValidate onSubmit={handleSubmit} aria-busy={isSavingProfile} className="flex flex-col gap-8">
        <fieldset disabled={isAccountBusy} className="flex min-w-0 flex-col gap-8">
          <legend className="sr-only">내 정보</legend>
          <MarkedSection id="profile-account-title" title="계정">
            <p className="flex min-h-12 items-center rounded-[14px] bg-canvas px-4 py-3 text-body leading-6 break-all text-ink-strong">
              <span className="sr-only">Google 계정 </span>{user.email}
            </p>
          </MarkedSection>
          <MarkedSection id="profile-info-title" title="기본 정보">
            <ProfileFields values={values} onChange={handleChange} errors={errors} />
          </MarkedSection>
          {/* 파트는 가입 후 바꿀 수 없어서 내 파트만 긴 칸 하나로 보여 준다. */}
          <MarkedSection id="profile-part-title" title="파트">
            <div className="flex flex-col gap-2">
              <p aria-describedby="profile-part-note" className="flex h-12 items-center justify-center rounded-[14px] bg-canvas px-2 text-center text-body leading-[22.4px] text-ink-strong">
                {AUTH_PART_LABELS[user.part]}
              </p>
              <p id="profile-part-note" className="text-caption leading-5 text-ink-500">파트는 바꿀 수 없어요</p>
            </div>
          </MarkedSection>
        </fieldset>
        {requestError && <p role="alert" className="-mt-4 text-body-sm text-error">{requestError}</p>}
        {/* Figma 01-d(11/15): 취소 대신 오른쪽 위 닫기 버튼. 저장하기 아래 구분선 밑에 로그아웃 | 회원 탈퇴. */}
        <FormDialogActions submitLabel="저장하기" busy={isSavingProfile} busyLabel="저장 중…" submitDisabled={isAccountBusy || !hasChanges}>
          <div className="mt-2 flex w-full flex-col items-center gap-6 border-t border-line pt-6">
            <div className="flex items-center gap-3">
              <TextLink size="sm" onClick={logout} disabled={isAccountBusy} aria-busy={isLoggingOut} aria-describedby={logoutError ? "profile-logout-error" : undefined} className="px-0.5 py-1 disabled:cursor-default disabled:opacity-60">
                {isLoggingOut ? "로그아웃 중…" : "로그아웃"}
              </TextLink>
              <span aria-hidden="true" className="h-3 w-px bg-line-medium" />
              <TextLink ref={withdrawButtonRef} variant="danger-link" size="sm" disabled={isAccountBusy} onClick={() => setWithdrawOpen(true)} className="px-0.5 py-1 disabled:cursor-default disabled:opacity-60">
                회원 탈퇴
              </TextLink>
            </div>
            {logoutError && <p id="profile-logout-error" role="alert" className="-mt-3 text-body-sm text-error">{logoutError}</p>}
          </div>
        </FormDialogActions>
      </form>
      {withdrawOpen && <WithdrawAccountModal onClose={() => setWithdrawOpen(false)} />}
    </>
  );
}
