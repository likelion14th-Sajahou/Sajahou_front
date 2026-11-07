"use client";

import { useState } from "react";
import Image from "next/image";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";

const PARTS = [
  { value: "planning-design", label: "기획·디자인", shape: "sunFine", color: "yellow" },
  { value: "frontend", label: "프론트엔드", shape: "circle", color: "blue" },
  { value: "backend", label: "백엔드", shape: "pentagon", color: "coral" },
];

function validateSignup(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "이름을 입력해 주세요";
  if (!/^\d{8}$/.test(values.studentId)) errors.studentId = "학번 8자리 숫자를 입력해 주세요";
  if (!values.department) errors.department = "학과를 골라 주세요";
  if (!values.part) errors.part = "파트를 하나 골라 주세요";
  if (!values.privacyConsent) errors.privacyConsent = "동의하지 않을 수 있지만, 이 경우 가입할 수 없어요.";
  return errors;
}

function SignupSelect({ label, name, defaultValue, error, children }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-label text-ink-muted">{label}</span>
      <span className="relative">
        <select
          name={name}
          defaultValue={defaultValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`h-[49px] w-full appearance-none rounded-[14px] border ${error ? "border-error-line" : "border-transparent"} bg-canvas pl-5 pr-7 text-body text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
        >
          {children}
        </select>
        <Image src="/images/signup/ec1a1.svg" alt="" width={10} height={6} className="pointer-events-none absolute top-1/2 right-[5px] -translate-y-1/2" />
      </span>
      {error && <span id={`${name}-error`} className="pt-0.5 text-label leading-[20.8px] text-error">{error}</span>}
    </label>
  );
}

export default function SignupForm() {
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({ name: "", studentId: "", department: "", part: "", privacyConsent: false });

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setValues((previous) => ({ ...previous, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateSignup(values);
    setErrors(nextErrors);
    const firstInvalidName = Object.keys(nextErrors)[0];
    if (firstInvalidName) event.currentTarget.querySelector(`[name="${firstInvalidName}"]`)?.focus();
  }

  return (
    <form className="mt-1" noValidate onSubmit={handleSubmit} onChange={handleChange}>
      <section aria-labelledby="signup-info-title" className="border-t border-line pt-[18px] pb-5">
        <h2 id="signup-info-title" className="mb-[14px] text-body leading-6 tracking-[-0.3px]">기본 정보</h2>
        <div className="grid grid-cols-1 gap-[14px] min-[360px]:grid-cols-2">
          <TextField label="이름" name="name" autoComplete="name" placeholder="김사자" error={errors.name} className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" />
          <TextField label="학번" name="studentId" inputMode="numeric" placeholder="20231234" error={errors.studentId} className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" />
          {/* 선택지는 디자인에서 확인한 항목만 사용한다. 전체 목록은 API 명세 확인 후 연결한다. */}
          <SignupSelect label="학과" name="department" defaultValue="" error={errors.department}>
            <option value="" disabled>학과 선택</option>
            <option value="소프트웨어학부">소프트웨어학부</option>
          </SignupSelect>
          <SignupSelect label="기수" name="cohort" defaultValue="14">
            <option value="14">14기</option>
          </SignupSelect>
        </div>
      </section>

      <fieldset className="min-w-0 border-t border-line pt-[18px] pb-5" aria-labelledby="signup-part-title" aria-describedby={errors.part ? "part-error" : undefined} aria-invalid={errors.part ? true : undefined}>
        <legend className="sr-only">파트</legend>
        <p id="signup-part-title" className="mb-[14px] text-body leading-6 tracking-[-0.3px]">파트</p>
        <div className="grid grid-cols-3 gap-[10px]">
          {PARTS.map(({ value, label, shape, color }) => (
            <label key={value} className="group relative cursor-pointer">
              <input type="radio" name="part" value={value} className="peer sr-only" />
              <span className="flex min-h-[100px] flex-col items-center gap-1.5 rounded-[18px] border border-line px-1 py-[14px] peer-checked:border-ink peer-checked:bg-selection peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink sm:px-[14px]">
                <span aria-hidden="true" className="relative block size-10 shrink-0">
                  <ShapeCharacter shape={shape} color={values.part === value ? color : "muted"} size={40} />
                </span>
                <span className="text-center text-label leading-6 whitespace-nowrap sm:text-body">{label}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.part && <p id="part-error" className="mt-[14px] pt-0.5 text-label leading-[20.8px] text-error">{errors.part}</p>}
      </fieldset>

      <label className="flex cursor-pointer items-start gap-[10px] rounded-[14px] bg-canvas p-[14px]">
        <span className="flex h-6 w-5 shrink-0 justify-center pt-[3px]">
          <input type="checkbox" name="privacyConsent" aria-invalid={errors.privacyConsent ? true : undefined} aria-describedby={errors.privacyConsent ? "privacyConsent-error" : undefined} className="h-[18px] w-[13px] cursor-pointer accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" />
        </span>
        <span className="min-w-0">
          <span className="block text-body-sm leading-[22.4px]">[필수] 개인정보 수집·이용에 동의해요</span>
          <span className="mt-1 block text-label leading-[19.5px] text-ink-subtle">
            사자록 회원 관리와 회고·자소서 기능 제공을 위해 이름·학번·학과·기수·파트·이메일을 수집하며, 회원 탈퇴 시까지 보관해요.
          </span>
        </span>
      </label>
      {errors.privacyConsent && <p id="privacyConsent-error" className="pt-0.5 text-label leading-[20.8px] text-error">{errors.privacyConsent}</p>}

      {/* 화면 검증만 수행한다. 가입 요청과 인증은 API 명세 확인 후 연결한다. */}
      <Button type="submit" variant="accent" className="mt-[18px] w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
        가입하고 시작하기
      </Button>
      <p className="mt-3 text-center leading-[19.5px]">
        <TextLink href="/login" variant="accent" size="sm">다른 Google 계정으로 로그인</TextLink>
      </p>
    </form>
  );
}
