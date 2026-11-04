const SIZE_CLASSES = {
  md: "h-9 px-3.5 text-body-sm",
  sm: "h-8 px-3 text-label",
};

export default function Chip({
  selected = false,
  size = "md",
  className = "",
  children,
  ...rest
}) {
  const stateClasses = selected
    ? "border-ink bg-ink text-white"
    : "border-line bg-white text-ink-muted";

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full border text-center ${stateClasses} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
