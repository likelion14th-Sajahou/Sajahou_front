import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";

export default function StartActions({ status = "idle" }) {
  const isWriting = status === "writing";

  return (
    <div className="mt-5 border-t border-line pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3.5">
        <TextLink href="/retrospective?preview=paused">
          이번 주는 휴회했어요
        </TextLink>
        {isWriting ? (
          <div className="grid w-full grid-cols-2 gap-2 sm:ml-auto sm:flex sm:w-auto">
            <Button variant="secondary" href="/retrospective" className="min-w-0 max-sm:px-3">
              처음부터
            </Button>
            <Button
              variant="accent"
              className="min-w-0 max-sm:px-3"
              href="/retrospective?step=materials"
            >
              이어 쓰기 →
            </Button>
          </div>
        ) : (
          <Button href="/retrospective?step=materials">
            시작하기 →
          </Button>
        )}
      </div>
    </div>
  );
}
