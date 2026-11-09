"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import ProfileFields from "./ProfileFields";
import GoogleAccountInfo from "./GoogleAccountInfo";
import PartField from "./PartField";
import WithdrawAccountModal from "./WithdrawAccountModal";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import { createProfileValues, toProfilePayload, validateProfile } from "@/lib/profile";

export default function ProfileContent() {
  const { user } = useAuth();
  // 인증 복원에서 조회한 사용자를 재사용하고, 계정이 바뀌면 입력 중인 값도 초기화한다.
  return user ? <ProfileForm key={user.id} user={user} /> : null;
}

function ProfileForm({ user }) {
  const { saveProfile, isSavingProfile, isAccountBusy, logout, isLoggingOut, logoutError, accountType } = useAuth();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [values, setValues] = useState(() => createProfileValues(user));
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const { toast, showToast, hideToast } = useToast();
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

  function handleCancel() {
    if (requestInFlight.current || isAccountBusy) return;
    setValues(createProfileValues(user));
    setErrors({});
    setRequestError("");
    hideToast();
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
    hideToast();
    try {
      const updatedUser = await saveProfile(changes, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setValues(createProfileValues(updatedUser));
      setErrors({});
      showToast("내 정보를 저장했어요");
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
      <GoogleAccountInfo email={user.email} />
      <form ref={formRef} className="mt-1" noValidate onSubmit={handleSubmit} aria-busy={isSavingProfile}>
        <fieldset disabled={isAccountBusy} className="min-w-0">
          <legend className="sr-only">내 정보</legend>
          <section aria-labelledby="profile-info-title" className="border-t border-line pt-[18px] pb-5">
            <h2 id="profile-info-title" className="mb-[14px] text-body leading-6 tracking-[-0.3px]">기본 정보</h2>
            <ProfileFields values={values} onChange={handleChange} errors={errors} />
          </section>
          <PartField id="profile-part" value={user.part} readOnly />
        </fieldset>
        {requestError && <p role="alert" className="pb-4 text-body-sm text-error">{requestError}</p>}
        <div className="mt-[18px] grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={handleCancel} disabled={isAccountBusy} className="w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">취소</Button>
          <Button type="submit" variant="accent" disabled={isAccountBusy || !hasChanges} className="w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
            {isSavingProfile ? "저장 중…" : "저장"}
          </Button>
        </div>
      </form>
      <div className="mt-3 text-center leading-[19.5px]">
        <TextLink variant="accent" size="sm" onClick={logout} disabled={isAccountBusy} aria-busy={isLoggingOut} aria-describedby={logoutError ? "profile-logout-error" : undefined} className="disabled:cursor-default disabled:opacity-60">
          {isLoggingOut ? "로그아웃 중…" : "로그아웃"}
        </TextLink>
        {logoutError && <p id="profile-logout-error" role="alert" className="mt-2 text-body-sm text-error">{logoutError}</p>}
      </div>
      <div className="mt-6 border-t border-line pt-4 text-center">
        {accountType === "google" ? (
          <TextLink ref={withdrawButtonRef} variant="danger" size="sm" disabled={isAccountBusy} onClick={() => setWithdrawOpen(true)} className="disabled:cursor-default disabled:opacity-60">
            회원 탈퇴
          </TextLink>
        ) : <p className="text-label text-ink-subtle">
          {accountType === "demo" ? "데모 계정은 탈퇴할 수 없어요." : "회원 탈퇴를 이용하려면 로그아웃 후 Google 계정으로 다시 로그인해 주세요."}
        </p>}
      </div>
      {withdrawOpen && accountType === "google" && <WithdrawAccountModal onClose={() => setWithdrawOpen(false)} />}
      <Toast toast={toast} onDismiss={hideToast} />
    </>
  );
}
