import ProjectList from "@/components/project/ProjectList";

export const metadata = {
  title: "프로젝트 | 사자록",
};

export default function ProjectsPage() {
  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 pt-10 pb-20">
      <ProjectList />
    </main>
  );
}
