import TextField from "@/components/ui/TextField";
import { RECORD_FIELDS } from "./recordFields";

// 11/14 디자인: 다섯 칸을 한 줄씩 세로로 배치한다. 칸별 속성은 getFieldProps로 받는다.
// getFieldProps가 className을 주면 기본 높이 대신 그것을 쓴다(정리 결과처럼 글 길이에 맞춰 늘릴 때).
export default function RecordFieldsGrid({ getFieldProps }) {
  return (
    <div className="grid w-full grid-cols-1 gap-3.5">
      {RECORD_FIELDS.map((field, index) => {
        const { className = "min-h-12 field-sizing-content", ...props } = getFieldProps(field, index);
        return (
          <div key={field.key} className="min-w-0">
            <TextField
              name={field.key}
              multiline
              rows={1}
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
