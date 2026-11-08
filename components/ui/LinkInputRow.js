import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

// 링크 입력창과 '추가' 버튼이다. Enter로도 추가한다. 링크 검사는 쓰는 화면이 onAdd에서 한다.
export default function LinkInputRow({ className = "", value, onChange, onAdd, ...inputProps }) {
  return (
    <div className={`flex min-w-0 flex-1 gap-1.5 ${className}`}>
      <TextField
        size="sm"
        className="min-w-0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onAdd();
          }
        }}
        {...inputProps}
      />
      <Button variant="secondary" size="sm" onClick={onAdd}>추가</Button>
    </div>
  );
}
