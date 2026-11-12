"use client";

import { useEffect, useRef } from "react";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import { DEPARTMENTS } from "@/lib/profile";

// 입력값·검증·제출 상태는 사용하는 폼에서 관리한다.
export default function ProfileFields({ values, onChange, errors = {} }) {
  const otherDepartmentRef = useRef(null);
  const focusOtherDepartment = useRef(false);

  useEffect(() => {
    if (focusOtherDepartment.current && values.department === "other") otherDepartmentRef.current?.focus();
    focusOtherDepartment.current = false;
  }, [values.department]);

  return (
    <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
      <TextField label="이름" name="name" value={values.name} onChange={onChange} autoComplete="name" placeholder="김사자" error={errors.name} className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" />
      <TextField label="학번" name="studentNo" value={values.studentNo} onChange={onChange} inputMode="numeric" placeholder="20231234" error={errors.studentNo} className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" />
      <SelectField label="학과" name="department" value={values.department} onChange={(event) => {
        focusOtherDepartment.current = event.target.value === "other";
        onChange(event);
      }} error={values.department === "other" ? undefined : errors.department}>
        <option value="" disabled>학과 선택</option>
        {DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
        <option value="other">기타 (직접 입력)</option>
      </SelectField>
      <SelectField label="기수" name="cohort" value={values.cohort} onChange={onChange} error={errors.cohort}>
        <option value="14">14기</option>
        <option value="13">13기</option>
        <option value="12">12기</option>
      </SelectField>
      {values.department === "other" && (
        <div className="sm:col-span-2">
          <TextField ref={otherDepartmentRef} label="학과 직접 입력" name="otherDepartment" value={values.otherDepartment} onChange={onChange} placeholder="학과 이름을 입력해 주세요" error={errors.department} />
        </div>
      )}
    </div>
  );
}
