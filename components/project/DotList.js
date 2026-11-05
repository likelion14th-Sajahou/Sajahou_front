export default function DotList({ items }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item} className="relative pl-3.5 text-label text-ink-muted">
          <span aria-hidden="true" className="absolute top-[8.4px] left-0 size-1.5 rounded-full bg-shape-green" />
          {item}
        </li>
      ))}
    </ul>
  );
}
