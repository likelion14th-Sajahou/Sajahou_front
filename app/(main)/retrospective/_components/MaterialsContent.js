import Card from "@/components/ui/Card";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import { MOCK_MATERIALS_BY_PART, MOCK_MATERIALS_CHANGED_PREVIEW, MOCK_RETROSPECTIVE } from "@/lib/mock/retrospective";
import RetrospectiveSteps from "./RetrospectiveSteps";
import MaterialsForm from "./MaterialsForm";
import CardTitle from "@/components/ui/CardTitle";

const UPLOAD_TIPS = [
  "노션 과제·회고 페이지 → Markdown ZIP",
  "세션 PPT → PDF",
  "코드·에러 → 텍스트 붙여넣기",
  "화면 → 캡처 이미지",
];

export default function MaterialsContent({ preview }) {
  const changePreview = preview === "materials-changed" ? MOCK_MATERIALS_CHANGED_PREVIEW : null;

  return (
    <>
      <RetrospectiveSteps currentStep={1} />
      <div className="mt-7 grid grid-cols-1 items-start gap-5 min-[901px]:grid-cols-[minmax(0,1fr)_320px]">
        <MaterialsForm
          key={changePreview ? "materials-changed" : "materials"}
          initialMaterialsByPart={changePreview?.materialsByPart ?? MOCK_MATERIALS_BY_PART}
          assignmentDueLabel={MOCK_RETROSPECTIVE.deadlines.find(({ id }) => id === "assignment").dueLabel}
          changePreview={changePreview}
        />
        <Card as="aside" size="md" aria-labelledby="upload-guide-title">
          <CardTitle id="upload-guide-title" action={<ShapeCharacter shape="circle" color="blue" size={16} face="none" cropped />}>
            이렇게 올리면 잘 읽어요
          </CardTitle>
          <ul className="mt-4 flex flex-col gap-1 pl-10 text-label text-ink-muted">
            {UPLOAD_TIPS.map((tip) => (
              <li key={tip} className="relative pl-3.5 before:absolute before:top-[8.44px] before:left-0 before:size-1.5 before:rounded-full before:bg-shape-green">
                {tip}
              </li>
            ))}
          </ul>
          <p className="mt-[15px] text-label leading-[1.5] text-ink-subtle">
            AI는 올린 자료에 있는 것만 써요. 없는 성과를 지어내지 않아요.
          </p>
        </Card>
      </div>
    </>
  );
}
