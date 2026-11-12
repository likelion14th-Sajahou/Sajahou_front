import Image from "next/image";

export default function SelectField({ label, error, className = "", children, ...rest }) {
  const errorId = error ? `${rest.id || rest.name}-error` : undefined;
  const accessibilityProps = error ? {
    "aria-invalid": true,
    "aria-describedby": [rest["aria-describedby"], errorId].filter(Boolean).join(" "),
  } : {};

  return (
    // 디자인 시스템(Figma 'Input' Type=Select): TextField와 같은 모양 + 오른쪽 20px 화살표. 아직 고르지 않았으면(값이 "") 글자를 placeholder 색으로.
    <label className="flex min-w-0 flex-col gap-2">
      <span className="font-display text-label leading-5 text-ink">{label}</span>
      <span className="relative">
        <select
          className={`h-12 w-full appearance-none rounded-[14px] border ${error ? "border-error-line" : "border-transparent"} bg-canvas pl-4 pr-11 text-body ${rest.value === "" ? "text-placeholder" : "text-ink"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${className}`}
          {...rest}
          {...accessibilityProps}
        >
          {children}
        </select>
        <Image src="/images/common/chevron-down-20.svg" alt="" width={20} height={20} className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2" />
      </span>
      {error && <span id={errorId} className="text-caption leading-5 text-error">{error}</span>}
    </label>
  );
}
