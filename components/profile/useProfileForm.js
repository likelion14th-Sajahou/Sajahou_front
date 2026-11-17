"use client";

import { useEffect, useRef, useState } from "react";

// 회원가입과 내 정보 수정 폼이 함께 쓰는 입력 상태다.
// - 칸을 고치면, 그 칸에 오류가 떠 있던 경우에만 validate로 다시 검사해 오류를 고치거나 지운다.
// - 제출에서 오류를 보여 줄 때(showErrors) 첫 번째로 틀린 칸에 포커스를 옮긴다. '직접 입력' 학과 칸은 학과 오류로 본다.
// initialValues: 처음 값(또는 처음 값을 만드는 함수), validate: 값 → { 칸 이름: 오류 문구 }.
export default function useProfileForm(initialValues, validate) {
  const formRef = useRef(null);
  const focusErrors = useRef(false);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");

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
      const nextError = validate(nextValues)[errorName];
      setErrors((previous) => {
        const next = { ...previous };
        if (nextError) next[errorName] = nextError;
        else delete next[errorName];
        return next;
      });
    }
  }

  function showErrors(nextErrors) {
    focusErrors.current = true;
    setErrors(nextErrors);
  }

  return { formRef, values, errors, requestError, setRequestError, handleChange, showErrors };
}
