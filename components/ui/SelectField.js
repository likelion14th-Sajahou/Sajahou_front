import Image from "next/image";
import DrawnFieldFrame from "./DrawnFieldFrame";

export default function SelectField({ label, error, className = "", wrapperClassName = "", size = "md", drawn = false, centered = false, displayValue, children, ...rest }) {
  const errorId = error ? `${rest.id || rest.name}-error` : undefined;
  const accessibilityProps = error ? {
    "aria-invalid": true,
    "aria-describedby": [rest["aria-describedby"], errorId].filter(Boolean).join(" "),
  } : {};
  const appearanceClasses = drawn
    ? "cursor-pointer rounded-full bg-white text-body-sm text-[#1f2433]"
    : `rounded-[14px] bg-canvas text-body ${rest.value === "" ? "text-placeholder" : "text-ink"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`;
  const alignmentClasses = centered ? "text-transparent! [&_option]:text-ink" : "";

  const control = (
    <>
      <select
        className={`${size === "sm" ? "h-[38px]" : "h-12"} w-full appearance-none border ${error ? "border-error-line" : "border-transparent"} pl-4 pr-11 ${appearanceClasses} ${alignmentClasses} ${className}`}
        {...rest}
        {...accessibilityProps}
      >
        {children}
      </select>
      {centered ? (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center px-7 text-body-sm text-[#1f2433]">
          <span className="relative min-w-0 max-w-full">
            <span className="absolute top-1/2 right-full mr-1 h-2 w-3 -translate-y-1/2 bg-[url(/images/common/chevron-down.svg)] bg-contain bg-center bg-no-repeat" />
            <span className="block truncate">{displayValue}</span>
          </span>
        </span>
      ) : (
        <Image src="/images/common/chevron-down-20.svg" alt="" width={20} height={20} className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2" />
      )}
    </>
  );

  return (
    // 디자인 시스템(Figma 'Input' Type=Select): TextField와 같은 모양 + 오른쪽 20px 화살표. 아직 고르지 않았으면(값이 "") 글자를 placeholder 색으로.
    <label className={`flex min-w-0 flex-col gap-2 ${wrapperClassName}`}>
      {label && <span className="font-display text-label leading-5 text-ink">{label}</span>}
      {drawn ? (
        <DrawnFieldFrame height={size === "sm" ? 38 : 48} error={Boolean(error)}>{control}</DrawnFieldFrame>
      ) : <span className="relative">{control}</span>}
      {error && <span id={errorId} className="text-caption leading-5 text-error">{error}</span>}
    </label>
  );
}
