export default function CompetencyTags({ tags, compact = false }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li key={tag} className={`rounded-full bg-canvas px-2.5 text-caption text-ink ${compact ? "leading-[19.2px]" : "py-1"}`}>
          #{tag}
        </li>
      ))}
    </ul>
  );
}
