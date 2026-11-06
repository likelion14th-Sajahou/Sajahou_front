import ShapeCharacter from "@/components/ui/ShapeCharacter";
import Card from "@/components/ui/Card";
import RetrospectiveSteps from "./RetrospectiveSteps";
import StartActions from "./StartActions";
import PausedRetrospective from "./PausedRetrospective";
import MaterialsContent from "./MaterialsContent";
import AiQuestionsContent from "./AiQuestionsContent";
import ReviewContent from "./ReviewContent";
import CompleteContent from "./CompleteContent";
import RetrospectiveWeekGate from "./RetrospectiveWeekGate";
import { MOCK_REVIEW_DRAFT } from "@/lib/mock/retrospective";

export default async function RetrospectiveContent({ searchParams, retrospective }) {
  const { preview, step, type } = await searchParams;
  const isAssignment = type === "assignment";
  const { week, deadlines } = retrospective;
  const pausedContent = <PausedRetrospective week={week} />;
  if (preview === "paused") return pausedContent;
  if (step === "materials") return <MaterialsContent preview={preview} />;
  if (step === "questions") return <AiQuestionsContent key={preview} initialComplete={preview === "questions-complete"} />;
  if (step === "review") return <ReviewContent initialDraft={MOCK_REVIEW_DRAFT} />;
  const completeContent = <CompleteContent week={week} initialDraft={MOCK_REVIEW_DRAFT} assignmentDueLabel={deadlines.find(({ id }) => id === "assignment").dueLabel} />;
  if (step === "complete") return completeContent;

  return (
    <RetrospectiveWeekGate isAssignment={isAssignment} paused={pausedContent} complete={completeContent}>
      <RetrospectiveSteps />

      <div className={`mt-7 grid items-start gap-5 ${isAssignment ? "grid-cols-[minmax(0,1fr)_320px]" : "grid-cols-1 min-[901px]:grid-cols-[minmax(0,1fr)_320px]"}`}>
        <Card as="section" size="md" aria-labelledby="start-title">
          <h2 id="start-title" className="text-heading tracking-[-0.02em]">
            {isAssignment ? "과제 회고를 시작해요" : "이번 주 세션 회고를 시작해요"}
          </h2>
          <div className={`mt-4 flex items-end gap-3.5 pt-1.5 pb-1 ${isAssignment ? "h-[120px]" : "sm:min-h-[120px]"}`}>
            <div className="relative size-16 shrink-0" aria-hidden="true">
              <ShapeCharacter
                shape={isAssignment ? "square" : "triangle"}
                color={isAssignment ? "green" : "coral"}
                size={64}
                cropped
                className={`absolute top-[8%] ${isAssignment ? "left-[8%]" : "left-[6%]"}`}
              />
            </div>
            <div className={`mb-[18px] min-w-0 rounded-[22px] rounded-bl-[6px] border-2 border-ink bg-shape-yellow leading-[1.45] tracking-[-0.01em] shadow-[3px_3px_0_var(--color-ink)] ${isAssignment ? "px-[22px] py-4 text-[19px]" : "w-[224px] px-4 py-3 text-[16px] sm:w-auto sm:px-[22px] sm:py-4 sm:text-[19px]"}`}>
              <p>{isAssignment ? "막혔던 그 순간이" : "지금은 조금 귀찮아도,"}</p>
              <p>{isAssignment ? "면접에서 제일 할 말 많은 이야기가 돼요." : "쌓이면 나만의 큰 자산이 돼요!"}</p>
            </div>
          </div>
          <StartActions isWritingPreview={preview === "writing"} isAssignment={isAssignment} />
        </Card>

        <Card as="aside" size="md" aria-labelledby="deadline-title">
          <div className="flex items-center justify-between border-b border-ink pb-3">
            <h2 id="deadline-title" className="text-[18px] tracking-[-0.01em]">
              마감일
            </h2>
            <ShapeCharacter shape="circle" color="blue" size={16} face="none" cropped />
          </div>
          <dl className="mt-4 flex flex-col gap-2 text-body-sm">
            {deadlines.map(({ id, label, dueLabel }) => (
              <div key={id} className="flex justify-between gap-4">
                <dt>{label}</dt>
                <dd>{dueLabel}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </RetrospectiveWeekGate>
  );
}
