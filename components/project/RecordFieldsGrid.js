import TextField from "@/components/ui/TextField";
import { RECORD_FIELDS } from "./recordFields";

// 첫 칸만 한 줄을 다 쓰고, 나머지 네 칸은 2열로 놓는다. 칸별 속성은 getFieldProps로 받는다.
// 11/13 디자인: 칸 이름은 작은 회색 굵은 글씨, 입력한 글은 Pretendard(font-input)다.
// getFieldProps가 className을 주면 기본 높이 대신 그것을 쓴다(정리 결과처럼 글 길이에 맞춰 늘릴 때).
export default function RecordFieldsGrid({ getFieldProps }) {
  return (
    <div className="grid w-full grid-cols-1 gap-x-3 gap-y-3.5 sm:grid-cols-2">
      {RECORD_FIELDS.map((field, index) => {
        const { className = "h-[74px]", ...props } = getFieldProps(field, index);
        return (
          <div key={field.key} className={index === 0 ? "sm:col-span-2" : ""}>
            <TextField
              name={field.key}
              multiline
              rows={2}
              labelClassName="text-caption leading-[19px] font-bold text-ink-500"
              className={`font-input leading-6 text-ink-strong! ${className}`}
              {...props}
            />
          </div>
        );
      })}
    </div>
  );
}
