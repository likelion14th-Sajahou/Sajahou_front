import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";

const RECORD_FIELDS = [
  { key: "did", label: "한 일" },
  { key: "problem", label: "고민·해결" },
  { key: "choice", label: "선택과 이유" },
  { key: "result", label: "결과·반응" },
  { key: "next", label: "다음" },
];

const ATTACHMENT_BADGES = {
  pdf: { label: "PDF", tone: "red" },
  notion: { label: "노션 MD", tone: "dark" },
  image: { label: "이미지", tone: "green" },
  link: { label: "링크", tone: "purple" },
};

const ADD_RECORD_HINTS = {
  active: "회의록·시안·링크를 올리면 AI가 정리를 도와요",
  done: "완료한 프로젝트도 기록을 더하거나 고칠 수 있어요",
};

function Attachment({ attachment }) {
  const { label, tone } = ATTACHMENT_BADGES[attachment.kind];

  return (
    <li className="flex items-center gap-2 rounded-xl border border-line bg-white py-1.5 pr-2 pl-2.5 text-label text-ink">
      <Badge tone={tone} size="xs">{label}</Badge>
      {attachment.name}
    </li>
  );
}

function RecordItem({ record, isLast }) {
  const { date, weekday, cardNumbers, attachments } = record;

  return (
    <li className="relative pb-5 pl-7">
      {!isLast && <span aria-hidden="true" className="absolute top-2 bottom-0 left-[7px] w-0.5 bg-line" />}
      <span
        aria-hidden="true"
        className="absolute top-1 left-0 size-4 rounded-full bg-shape-yellow shadow-[0_0_0_3px_var(--color-canvas)]"
      />
      <article className="flex flex-col gap-2.5 rounded-[18px] bg-white px-[18px] py-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1 text-label text-ink-muted">
            {date}({weekday})
            {cardNumbers.map((number) => (
              <Badge key={number} tone="amber">카드 {number}에 쓰임</Badge>
            ))}
          </p>
          <div className="flex items-center gap-3">
            <TextLink size="sm">수정</TextLink>
            <TextLink variant="danger" size="sm">삭제</TextLink>
          </div>
        </div>
        <dl className="grid grid-cols-[62.8px_minmax(0,1fr)] gap-x-3 gap-y-1">
          {RECORD_FIELDS.filter(({ key }) => record[key]).map(({ key, label }) => (
            <div key={key} className="col-span-2 grid grid-cols-subgrid">
              <dt className="text-label leading-[20.15px] text-ink-subtle">{label}</dt>
              <dd className="text-body-sm leading-[21.7px] text-ink">{record[key]}</dd>
            </div>
          ))}
        </dl>
        {attachments.length > 0 && (
          <ul aria-label="첨부 자료" className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <Attachment key={attachment.id} attachment={attachment} />
            ))}
          </ul>
        )}
      </article>
    </li>
  );
}

export default function ProjectRecords({ project, records }) {
  const { id, status } = project;

  return (
    <section aria-label="기록" className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button href={`/projects/${id}?record=new`} scroll={false}>+ 기록 추가</Button>
        <p className="text-label leading-[19.5px] text-ink-subtle">{ADD_RECORD_HINTS[status]}</p>
      </div>
      {records.length > 0 ? (
        <ol>
          {records.map((record, index) => (
            <RecordItem key={record.id} record={record} isLast={index === records.length - 1} />
          ))}
        </ol>
      ) : (
        <p className="rounded-[20px] border border-dashed border-[#d7d3cb] p-6 text-center text-body text-ink-subtle">
          첫 기록을 남겨 보세요. 한 줄이어도 괜찮아요.
        </p>
      )}
    </section>
  );
}
