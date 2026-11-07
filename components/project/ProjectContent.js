import { getCompetencyNames } from "@/lib/mock/competencies";
import { MOCK_USER } from "@/lib/mock/user";
import ProjectView from "./ProjectView";

export default async function ProjectContent({ params, searchParams }) {
  const { id } = await params;
  const { record } = await searchParams;

  return (
    <ProjectView
      projectId={id}
      competencies={getCompetencyNames(MOCK_USER.part)}
      initialIsAdding={record === "new"}
    />
  );
}
