import Card from "@/components/ui/Card";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import { MOCK_MATERIALS } from "@/lib/mock/retrospective";
import RetrospectiveSteps from "./RetrospectiveSteps";
import MaterialsForm from "./MaterialsForm";

const UPLOAD_TIPS = [
  "노션 과제·회고 페이지 → Markdown ZIP",
  "세션 PPT → PDF",
  "코드·에러 → 텍스트 붙여넣기",
  "화면 → 캡처 이미지",
];

export default function MaterialsContent() {
  return (
    <>
      <RetrospectiveSteps currentStep={1} />
      <div className="mt-7 grid grid-cols-1 items-start gap-5 min-[901px]:grid-cols-[minmax(0,1fr)_320px]">
        <MaterialsForm initialMaterials={MOCK_MATERIALS} />
        <Card as="aside" size="md" aria-labelledby="upload-guide-title">
          <div className="flex items-center justify-between border-b border-ink pb-3">
            <h2 id="upload-guide-title" className="text-[18px] tracking-[-0.01em]">
              이렇게 올리면 잘 읽어요
            </h2>
            <ShapeCharacter shape="circle" color="blue" size={16} face="none" cropped />
          </div>
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
