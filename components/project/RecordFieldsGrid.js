import TextField from "@/components/ui/TextField";
import { RECORD_FIELDS } from "./recordFields";

// 첫 칸만 한 줄을 다 쓰고, 나머지 네 칸은 2열로 놓는다. 칸별 속성은 getFieldProps로 받는다.
export default function RecordFieldsGrid({ getFieldProps }) {
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
      {RECORD_FIELDS.map((field, index) => (
        <div key={field.key} className={index === 0 ? "sm:col-span-2" : ""}>
          <TextField
            name={field.key}
            multiline
            rows={2}
            className="h-[76px]"
            {...getFieldProps(field, index)}
          />
        </div>
      ))}
    </div>
  );
}
