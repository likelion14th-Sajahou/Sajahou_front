"use client";

import { useEffect, useRef, useState } from "react";
import FormSection from "@/components/profile/FormSection";
import PartField from "@/components/profile/PartField";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import ProfileFields from "@/components/profile/ProfileFields";
import TextLink from "@/components/ui/TextLink";
import { useAuth } from "@/components/layout/AuthProvider";
import { signupWithGoogle } from "@/lib/auth";
import { createProfileValues, toProfilePayload, validateProfile } from "@/lib/profile";

function validateSignup(values) {
  const errors = validateProfile(values);
  if (!values.part) errors.part = "파트를 하나 골라 주세요";
  if (!values.privacyAgreed) errors.privacyAgreed = "동의하지 않을 수 있지만, 이 경우 가입할 수 없어요.";
  return errors;
}

export default function SignupForm() {
  const { signup, cancelSignup, markSignupSubmitted, completeLogin } = useAuth();
  const formRef = useRef(null);
  const focusErrors = useRef(false);
  const requestInFlight = useRef(false);
  const controllerRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState(() => ({
    ...createProfileValues({ name: signup?.suggestedName }),
    part: "", privacyAgreed: false,
  }));

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
    const { name, value, type, checked } = event.target;
    const nextValues = { ...values, [name]: type === "checkbox" ? checked : name === "cohort" ? Number(value) : value };
    setValues(nextValues);
    setRequestError("");
    const errorName = name === "otherDepartment" ? "department" : name;
    if (errors[errorName]) {
      const nextError = validateSignup(nextValues)[errorName];
      setErrors((previous) => {
        const nextErrors = { ...previous };
        if (nextError) nextErrors[errorName] = nextError;
        else delete nextErrors[errorName];
        return nextErrors;
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (requestInFlight.current || !signup) return;
    if (!signup.submitted) {
      const nextErrors = validateSignup(values);
      focusErrors.current = true;
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) return;
      if (signup.expiresAt <= Date.now()) {
        cancelSignup("가입 시간이 만료되었어요. 다시 로그인해 주세요.");
        return;
      }
    }

    requestInFlight.current = true;
    setSubmitting(true);
    setRequestError("");
    const controller = new AbortController();
    controllerRef.current = controller;
    let signupAccepted = Boolean(signup.submitted);
    try {
      if (!signupAccepted) {
        await signupWithGoogle({
          signupToken: signup.signupToken, ...toProfilePayload(values),
          part: values.part, privacyAgreed: values.privacyAgreed,
        }, { signal: controller.signal });
        if (controller.signal.aborted) return;
        signupAccepted = true;
        markSignupSubmitted();
      }
      // 성공하면 SignupSession이 홈으로 이동한다. 실패 시 가입 POST는 반복하지 않는다.
      await completeLogin({ signal: controller.signal });
    } catch (failure) {
      if (controller.signal.aborted) return;
      if (failure.status === 401) {
        cancelSignup(signupAccepted ? "로그인 상태를 확인할 수 없어요. 다시 로그인해 주세요."
          : "가입 시간이 만료되었어요. 다시 로그인해 주세요.");
      } else if (!signupAccepted && failure.isValidationError) {
        const fieldErrors = {};
        for (const name of ["name", "studentNo", "department", "cohort", "part", "privacyAgreed"]) {
          if (typeof failure.fields?.[name] === "string") fieldErrors[name] = failure.fields[name];
        }
        focusErrors.current = true;
        setErrors(fieldErrors);
        setRequestError(failure.message);
      } else {
        setRequestError(signupAccepted ? "가입은 완료됐어요. 로그인 상태를 다시 확인해 주세요."
          : "가입 요청을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      requestInFlight.current = false;
      if (!controller.signal.aborted) setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit} aria-busy={submitting}>
      {requestError && <p role="alert" className="pb-3 text-label text-error">{requestError}</p>}
      <fieldset disabled={submitting || signup?.submitted} className="min-w-0">
        <legend className="sr-only">회원가입 정보</legend>
        <FormSection id="signup-info-title" title="기본 정보">
          <ProfileFields values={values} onChange={handleChange} errors={errors} />
        </FormSection>

        <PartField id="signup-part" value={values.part} onChange={handleChange} error={errors.part} />

        {/* 개인정보 동의(Figma 'Agreement Box') */}
        <label className="flex cursor-pointer items-start gap-2 rounded-[14px] bg-canvas p-4">
          <span className="flex shrink-0 pt-px">
            <Checkbox name="privacyAgreed" checked={values.privacyAgreed} onChange={handleChange} aria-invalid={errors.privacyAgreed ? true : undefined} aria-describedby={errors.privacyAgreed ? "privacyAgreed-error" : undefined} />
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="text-body-sm leading-[22px] text-ink">[필수] 개인정보 수집·이용에 동의해요</span>
            <span className="text-caption leading-[18px] text-ink-subtle">
              사자록 회원 관리와 회고·자소서 기능 제공을 위해 이름·학번·학과·기수·파트·이메일을 수집하며, 회원 탈퇴 시까지 보관해요.
            </span>
          </span>
        </label>
        {errors.privacyAgreed && <p id="privacyAgreed-error" className="pt-2 text-caption leading-5 text-error">{errors.privacyAgreed}</p>}
      </fieldset>

      <Button type="submit" disabled={submitting} className="mt-6 w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
        {submitting ? "로그인 확인 중…" : signup?.submitted ? "로그인 상태 다시 확인" : "가입하고 시작하기"}
      </Button>
      <p className="mt-6 text-center">
        <TextLink href="/login" size="sm">다른 Google 계정으로 로그인</TextLink>
      </p>
    </form>
  );
}
