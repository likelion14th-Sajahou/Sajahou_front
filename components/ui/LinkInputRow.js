import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

// 링크 입력창과 '추가' 버튼이다. Enter로도 추가한다. 링크 검사는 쓰는 화면이 onAdd에서 한다.
// buttonVariant·inputClassName: 화면 디자인에 맞춰 버튼 모양과 입력창 스타일을 바꿀 때 준다.
export default function LinkInputRow({ className = "", buttonVariant = "secondary", inputClassName = "", value, onChange, onAdd, ...inputProps }) {
  return (
    <div className={`flex min-w-0 flex-1 gap-1.5 ${className}`}>
      <TextField
        size="sm"
        className={`min-w-0 ${inputClassName}`}
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
      <Button variant={buttonVariant} size="sm" onClick={onAdd}>추가</Button>
    </div>
  );
}
