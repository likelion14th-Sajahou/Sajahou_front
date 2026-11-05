import Link from "next/link";
import { MOCK_PROJECTS } from "@/lib/mock/projects";
import ProjectHeader from "./ProjectHeader";
import ProjectRecords from "./ProjectRecords";

export default async function ProjectContent({ params }) {
  const { id } = await params;
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

  return (
    <>
      <ProjectHeader project={project} />
      <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-5 pt-6">
        <ProjectRecords project={project} />
      </div>
    </>
  );
}
