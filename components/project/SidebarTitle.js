import ShapeCharacter from "@/components/ui/ShapeCharacter";

export default function SidebarTitle({ shape = "sunFine", color = "yellow", size = 18, children }) {
  return (
    <div className="flex items-center justify-between border-b border-ink pb-3">
      <h2 className="text-[18px] tracking-[-0.18px] text-ink">{children}</h2>
      <ShapeCharacter shape={shape} color={color} face="none" size={size} />
    </div>
  );
}
