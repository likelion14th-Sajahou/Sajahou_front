import Image from "next/image";
import Button from "@/components/ui/Button";

export default function PausedRetrospective() {
  return (
    <section
      aria-labelledby="paused-title"
      className="mx-auto mt-6 flex w-full max-w-[620px] flex-col items-center gap-3.5 rounded-[24px] bg-white px-6 py-8 text-center sm:rounded-[32px] sm:px-8 sm:py-10"
    >
      <div className="relative size-[90px]" aria-hidden="true">
        <Image
          src="/images/retrospective/paused-character.svg"
          alt=""
          width={79.2}
          height={39.6}
          className="absolute top-[34%] left-[6%]"
        />
      </div>
      <h2 id="paused-title" className="text-heading text-balance break-keep tracking-[-0.02em] sm:text-[24px]">
        35주차는 휴회로 표시했어요
      </h2>
      <p className="text-body text-balance break-keep text-ink-subtle">
        쉬어 가는 주예요. 회고와 과제를 쓰지 않아도 돼요.
      </p>
      <div className="flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
        <Button href="/">홈으로</Button>
        <Button variant="secondary" href="/retrospective">
          휴회가 아니었어요
        </Button>
      </div>
    </section>
  );
}
