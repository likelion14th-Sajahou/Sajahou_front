export default function SectionHeader({ title, action }) {
  return (
    <div className="flex w-full items-baseline justify-between gap-4">
      <h2 className="text-title tracking-[-0.4px] text-ink">{title}</h2>
      {action}
    </div>
  );
}
