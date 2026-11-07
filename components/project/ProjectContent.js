import ProjectView from "./ProjectView";

export default async function ProjectContent({ params, searchParams }) {
  const { id } = await params;
  const { record } = await searchParams;

  return (
    <ProjectView
      projectId={id}
      initialIsAdding={record === "new"}
    />
  );
}
