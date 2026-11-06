import { COMPETENCIES } from "@/lib/mock/myRecord";
import ProjectView from "./ProjectView";

export default async function ProjectContent({ params, searchParams }) {
  const { id } = await params;
  const { record } = await searchParams;

  return (
    <ProjectView
      projectId={id}
      competencies={COMPETENCIES}
      initialIsAdding={record === "new"}
    />
  );
}
