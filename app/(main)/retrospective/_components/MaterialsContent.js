import Image from "next/image";
import DrawnBorder from "@/components/ui/DrawnBorder";
import RetrospectiveSteps from "./RetrospectiveSteps";
import MaterialsStep from "./MaterialsStep";

// 글머리는 Figma의 별 아이콘(4각·8각·5각)이다.
const UPLOAD_TIPS = [
  { text: "노션 과제·회고 페이지 → Markdown ZIP", bullet: "bullet-star-4" },
  { text: "세션 PPT → PDF", bullet: "bullet-star-8" },
  { text: "코드·에러 → 텍스트 붙여넣기", bullet: "bullet-star-5" },
  { text: "화면 → 캡처 이미지", bullet: "bullet-star-4" },
];

export default function MaterialsContent() {
  return (
    <>
      {/* 제목·단계·카드 사이 간격은 시작 화면과 같다(프로토타입 11/13). */}
      <RetrospectiveSteps currentStep={1} className="mt-[38px]" />
      <div className="mt-10 grid grid-cols-1 items-start gap-4 min-[901px]:grid-cols-[minmax(0,1fr)_320px]">
        <MaterialsStep />
        {/* 오른쪽 안내 카드(Figma 'Sidebar'): 마감일 카드와 같은 노란 손그림 테두리 */}
        <aside aria-labelledby="upload-guide-title" className="relative rounded-[24px] bg-white p-6">
          <DrawnBorder variant="deadline-card" />
          <h2 id="upload-guide-title" className="border-b border-ink pb-3 font-display text-[18px] leading-[28.8px] tracking-[-0.18px] text-ink">
            이렇게 올리면 잘 읽어요
          </h2>
          <ul className="flex flex-col gap-2 pt-4 text-label leading-[20.8px] text-ink">
            {UPLOAD_TIPS.map(({ text, bullet }) => (
              <li key={text} className="flex items-start gap-3">
                <Image src={`/images/retrospective/${bullet}.png`} alt="" width={16} height={16} className="mt-0.5 shrink-0 object-contain" />
                {text}
              </li>
            ))}
          </ul>
          <p className="pt-4 text-label leading-[19.5px] text-ink">
            AI는 올린 자료에 있는 것만 써요.
            <br />
            없는 성과를 지어내지 않아요.
          </p>
        </aside>
      </div>
    </>
  );
}
