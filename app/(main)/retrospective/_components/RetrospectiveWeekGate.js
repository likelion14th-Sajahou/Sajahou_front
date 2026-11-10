"use client";

import Button from "@/components/ui/Button";
import { useRetrospectivePreview } from "./RetrospectivePreview";

// 과제 회고는 '나중에 쓸게요'를 고른 주에만 따로 생긴다(R-23). 그 밖의 주에 과제 회고로 들어오면 이유와 세션 회고로 가는 버튼을 보여 준다.
const NO_ASSIGNMENT_MESSAGES = {
  RECORD: "과제는 세션 회고에 함께 썼어요",
  NONE: "과제가 없다고 표시했어요",
};

function NoAssignmentRetrospective({ assignmentMode }) {
  return (
    <section
      aria-labelledby="no-assignment-title"
      className="mx-auto mt-6 flex w-full max-w-[620px] flex-col items-center gap-3.5 rounded-[24px] bg-white px-6 py-8 text-center sm:rounded-[32px] sm:px-8 sm:py-10"
    >
      <h2 id="no-assignment-title" className="text-heading text-balance break-keep tracking-[-0.02em] sm:text-[24px]">
        {NO_ASSIGNMENT_MESSAGES[assignmentMode] ?? "과제를 '나중에 쓸게요'로 고른 주에만 과제 회고를 따로 써요"}
      </h2>
      <Button href="/retrospective">세션 회고로</Button>
    </section>
  );
}

// 시작 화면에 들어왔을 때 이번 주가 이미 휴회나 완료면 그 화면을 먼저 보여 준다.
// 과제 회고는 세션 회고와 따로 완료 여부를 본다.
export default function RetrospectiveWeekGate({ isAssignment, paused, complete, children }) {
  const { session, assignment } = useRetrospectivePreview();

  if (session.state === "RESTED") {
    return paused;
  }

  if (isAssignment) {
    if (!assignment) return <NoAssignmentRetrospective assignmentMode={session.assignmentMode} />;
    if (assignment.state === "COMPLETED") return complete;
    return children;
  }

  if (session.state === "COMPLETED") {
    return complete;
  }

  return children;
}
