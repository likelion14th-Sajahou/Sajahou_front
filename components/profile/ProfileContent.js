"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import ProfileFields from "./ProfileFields";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import { AUTH_PART_LABELS } from "@/lib/authConfig";
import { createProfileValues, toProfilePayload, validateProfile } from "@/lib/profile";

export default function ProfileContent() {
  const { user } = useAuth();
  // 인증 복원에서 조회한 사용자를 재사용하고, 계정이 바뀌면 입력 중인 값도 초기화한다.
  return user ? <ProfileForm key={user.id} user={user} /> : null;
}

function ProfileForm({ user }) {
  const { saveProfile, isSavingProfile, isAccountBusy, logout, isLoggingOut, logoutError } = useAuth();
  const [values, setValues] = useState(() => createProfileValues(user));
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const { toast, showToast, hideToast } = useToast();
  const formRef = useRef(null);
  const focusErrors = useRef(false);
  const requestInFlight = useRef(false);
  const controllerRef = useRef(null);
  const payload = toProfilePayload(values);
  const changes = Object.fromEntries(Object.entries(payload).filter(([field, value]) => value !== user[field]));
  const hasChanges = Object.keys(changes).length > 0;

  useEffect(() => () => controllerRef.current?.abort(), []);

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
      <Card as="section" aria-label="내 정보 수정" className="mt-6">
        <form ref={formRef} noValidate onSubmit={handleSubmit} aria-busy={isSavingProfile}>
          <fieldset disabled={isAccountBusy} className="min-w-0">
            <legend className="sr-only">내 정보</legend>
            <section aria-labelledby="profile-account-title" className="pb-5">
              <h2 id="profile-account-title" className="mb-[14px] text-body">계정 정보</h2>
              <div className="grid min-w-0 grid-cols-1 gap-[14px] sm:grid-cols-2">
                <TextField label="Google 계정 이메일" name="email" value={user.email ?? ""} readOnly />
                <TextField label="파트" name="part" value={AUTH_PART_LABELS[user.part]} readOnly />
              </div>
            </section>
            <section aria-labelledby="profile-info-title" className="border-t border-line pt-[18px] pb-5">
              <h2 id="profile-info-title" className="mb-[14px] text-body">기본 정보</h2>
              <ProfileFields values={values} onChange={handleChange} errors={errors} />
            </section>
          </fieldset>
          {requestError && <p role="alert" className="pb-4 text-body-sm text-error">{requestError}</p>}
          <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5">
            <Button variant="outline" onClick={handleCancel} disabled={isAccountBusy}>취소</Button>
            <Button type="submit" variant="accent" disabled={isAccountBusy || !hasChanges}>
              {isSavingProfile ? "저장 중…" : "저장"}
            </Button>
          </div>
        </form>
        <div className="mt-6 border-t border-line pt-5">
          <TextLink onClick={logout} disabled={isAccountBusy} aria-busy={isLoggingOut} aria-describedby={logoutError ? "profile-logout-error" : undefined} className="disabled:cursor-default disabled:opacity-60">
            {isLoggingOut ? "로그아웃 중…" : "로그아웃"}
          </TextLink>
          {logoutError && <p id="profile-logout-error" role="alert" className="mt-2 text-body-sm text-error">{logoutError}</p>}
        </div>
      </Card>
      <Toast toast={toast} onDismiss={hideToast} />
    </>
  );
}
