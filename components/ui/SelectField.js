import Image from "next/image";

export default function SelectField({ label, error, className = "", children, ...rest }) {
  const errorId = error ? `${rest.id || rest.name}-error` : undefined;
  const accessibilityProps = error ? {
    "aria-invalid": true,
    "aria-describedby": [rest["aria-describedby"], errorId].filter(Boolean).join(" "),
  } : {};

  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-label text-ink-muted">{label}</span>
      <span className="relative">
        <select
          className={`h-[49px] w-full appearance-none rounded-[14px] border ${error ? "border-error-line" : "border-transparent"} bg-canvas pl-5 pr-7 text-body text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${className}`}
          {...rest}
          {...accessibilityProps}
        >
          {children}
        </select>
        <Image src="/images/common/chevron-down.svg" alt="" width={10} height={6} className="pointer-events-none absolute top-1/2 right-[5px] -translate-y-1/2" />
      </span>
      {error && <span id={errorId} className="pt-0.5 text-label leading-[20.8px] text-error">{error}</span>}
    </label>
  );
}
