import Link from "next/link";
import { COMPETENCIES } from "@/lib/mock/myRecord";
import { MOCK_PROJECTS } from "@/lib/mock/projects";
import { MOCK_STORY_CARDS } from "@/lib/mock/storyCards";
import ProjectView from "./ProjectView";

export default async function ProjectContent({ params, searchParams }) {
  const { id } = await params;
  const { record } = await searchParams;
  const project = MOCK_PROJECTS.find((item) => item.id === id);

  // 프로젝트 API가 없어 홈에서 새로 만든 프로젝트는 아직 이 목록에 없다.
  if (!project) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Link href="/" className="text-body-sm text-ink-muted">
          ← 홈
        </Link>
        <p role="status" className="text-body text-ink-subtle">
          프로젝트를 찾을 수 없어요.
        </p>
      </div>
    );
  }

  const storyCards = project.representativeCards.map(({ cardId }) =>
    MOCK_STORY_CARDS.find(({ id: storyCardId }) => storyCardId === cardId),
  );

  return (
    <ProjectView
      project={project}
      storyCards={storyCards}
      competencies={COMPETENCIES}
      initialIsAdding={record === "new"}
    />
  );
}
