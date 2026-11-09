export const DEPARTMENTS = [
  "건설환경플랜트공학과", "경영학부", "공예과", "미디어커뮤니케이션학부",
  "산업보안학과", "소프트웨어학부", "심리학과", "약학부", "영어영문학과",
  "예술공학부", "유아교육과", "응용통계학과", "전자전기공학", "프랑스어문학과",
];

// API의 학과 문자열을 선택 상자와 직접 입력칸의 값으로 복원한다.
export function createProfileValues(user = {}) {
  const department = user.department ?? "";
  const isOtherDepartment = Boolean(department) && !DEPARTMENTS.includes(department);
  return {
    name: user.name ?? "",
    studentNo: user.studentNo ?? "",
    department: isOtherDepartment ? "other" : department,
    otherDepartment: isOtherDepartment ? department : "",
    cohort: user.cohort ?? 14,
  };
}

export function validateProfile(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "이름을 입력해 주세요";
  else if (values.name.trim().length > 50) errors.name = "이름은 1~50자로 입력해 주세요";
  if (!/^\d{8}$/.test(values.studentNo)) errors.studentNo = "학번 8자리 숫자를 입력해 주세요";
  if (!values.department) errors.department = "학과를 골라 주세요";
  else if (values.department === "other" && !values.otherDepartment.trim()) errors.department = "학과 이름을 입력해 주세요";
  if (![12, 13, 14].includes(values.cohort)) errors.cohort = "기수를 골라 주세요";
  return errors;
}

// 화면 전용 otherDepartment와 가입 전용 필드는 API 기본 정보에 포함하지 않는다.
export function toProfilePayload(values) {
  return {
    name: values.name.trim(),
    studentNo: values.studentNo,
    department: values.department === "other" ? values.otherDepartment.trim() : values.department,
    cohort: values.cohort,
  };
}
