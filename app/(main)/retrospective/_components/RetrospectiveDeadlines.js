"use client";

import { useRetrospectivePreview } from "./RetrospectivePreview";

// 시작 화면 오른쪽 '마감일' 박스다. 내 파트의 세션·과제 마감을 보여 준다(R-07).
export default function RetrospectiveDeadlines() {
  const { deadlineLabels } = useRetrospectivePreview();
  const items = [
    { label: "세션 회고", dueLabel: deadlineLabels.session },
    { label: "과제 회고", dueLabel: deadlineLabels.assignment },
  ];

  return (
    <dl className="mt-4 flex flex-col gap-2 font-display text-body-sm leading-[22.4px] text-ink">
      {items.map(({ label, dueLabel }) => (
        <div key={label} className="flex justify-between gap-4">
          <dt>{label}</dt>
          <dd>{dueLabel}</dd>
        </div>
      ))}
    </dl>
  );
}
