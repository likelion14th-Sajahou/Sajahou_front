import MatchingForm from "./MatchingForm";

// 주소의 jobPostingId(찾기 뒤에 남긴 공고 id)를 읽어 폼에 넘긴다. 있으면 그 매칭 결과(39번)를 불러온다.
export default async function MatchingContent({ searchParams }) {
  const { jobPostingId } = await searchParams;
  return <MatchingForm jobPostingId={typeof jobPostingId === "string" ? jobPostingId : null} />;
}
