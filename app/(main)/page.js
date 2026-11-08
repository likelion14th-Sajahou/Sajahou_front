import HomeContent from "@/components/home/HomeContent";
import RequireAuth from "@/components/layout/RequireAuth";

export default function HomePage() {
  return (
    <RequireAuth className="min-h-[calc(100svh-110px)] px-4 py-8 md:min-h-[calc(100svh-68px)]">
      <HomeContent />
    </RequireAuth>
  );
}
