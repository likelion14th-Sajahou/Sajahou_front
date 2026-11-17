// 저장된 이름이 변경되어도 ID로 현재 목록에 연결한다. 보이지 않는 역량과 중복은 선택 개수에서 제외한다.
export function selectedCompetencyNames(selected, competencies) {
  const names = selected.map((value) => {
    if (typeof value === "string") return competencies.find((item) => item.name === value)?.name;
    const id = value.id ?? value.competencyId;
    return competencies.find((item) => id != null ? String(item.id) === String(id) : item.name === value.name)?.name;
  });
  return [...new Set(names.filter(Boolean))];
}
