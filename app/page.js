import HomeContent from "@/components/home/HomeContent";
import { MOCK_USER } from "@/lib/mock/user";

export default function HomePage() {
  return <HomeContent userName={MOCK_USER.name} />;
}
