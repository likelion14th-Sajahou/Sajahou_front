import { RECORD_FIELDS } from "./recordFields";

// fieldKeys를 주면 그 칸만 살핀다. 칸을 채우면 안내에서 바로 빠지도록 입력값으로 계산한다(H-14).
export default function EmptyFieldsNotice({ fields, fieldKeys }) {
  const emptyLabels = RECORD_FIELDS
    .filter(({ key }) => (!fieldKeys || fieldKeys.includes(key)) && !fields[key]?.trim())
    .map(({ formLabel }) => formLabel);

  if (emptyLabels.length === 0) {
    return null;
  }

  return (
    <p className="flex items-start gap-2 rounded-xl bg-tint-yellow px-3 py-2.5 text-label leading-[20.8px] text-tint-yellow-ink">
      <span aria-hidden="true">⚑</span>
      {emptyLabels.join(", ")}은(는) 기록에서 찾지 못해 비워 뒀어요.
    </p>
  );
}
