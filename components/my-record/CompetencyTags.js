export default function CompetencyTags({ tags }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li key={tag} className="rounded-full bg-canvas px-2.5 py-1 text-caption text-ink">
          #{tag}
        </li>
      ))}
    </ul>
  );
}
