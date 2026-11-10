import CardTitle from "@/components/ui/CardTitle";

export default function RecordFormTitle({ id, date, children }) {
  return (
    <div className="pb-4">
      <CardTitle
        id={id}
        action={date && <p className="text-label leading-[19.5px] text-ink-subtle">{date}</p>}
      >
        {children}
      </CardTitle>
    </div>
  );
}
