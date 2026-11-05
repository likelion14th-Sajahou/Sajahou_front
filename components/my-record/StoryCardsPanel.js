"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Chip from "@/components/ui/Chip";
import Modal from "@/components/ui/Modal";
import StoryCardDetail from "./StoryCardDetail";
import StoryCardList from "./StoryCardList";

const ALL = "all";

const TYPE_FILTERS = [
  { id: ALL, label: "전체" },
  { id: "session", label: "세션 회고" },
  { id: "assignment", label: "과제 회고" },
  { id: "project", label: "프로젝트" },
];

const HIGHLIGHT_DURATION_MS = 3000;

const FIELD_CLASSES =
  "h-[38px] rounded-[14px] border border-transparent bg-canvas text-body-sm text-ink";

function matchesSearch({ title, tags, evidence }, search) {
  const target = `${title} ${tags.map((tag) => `#${tag}`).join(" ")} ${evidence}`;

  return target.toLowerCase().includes(search);
}

export default function StoryCardsPanel({
  cards,
  competencies,
  week,
  initialCardId,
  initialHighlightedCardId,
  onDeleteCard,
  onUpdateCard,
}) {
  const [type, setType] = useState(ALL);
  const [competency, setCompetency] = useState(ALL);
  const [search, setSearch] = useState("");
  const [openCardId, setOpenCardId] = useState(initialCardId);
  const [highlightedCardId, setHighlightedCardId] = useState(initialHighlightedCardId);
  const openCard = cards.find(({ id }) => id === openCardId);

  // 자소서 매칭에서 넘어온 카드로 스크롤하고, 잠깐 뒤 강조를 지운다(A-09).
  useEffect(() => {
    if (!highlightedCardId) {
      return undefined;
    }

    document
      .getElementById(`story-card-${highlightedCardId}`)
      ?.scrollIntoView({ block: "center" });

    const timer = setTimeout(() => setHighlightedCardId(undefined), HIGHLIGHT_DURATION_MS);

    return () => clearTimeout(timer);
  }, [highlightedCardId]);

  function closeCard() {
    setOpenCardId(undefined);

    // 주소로 연 팝업이 새로고침할 때 다시 열리지 않도록 card 값을 지우고, 지금 탭은 주소에 남긴다.
    const url = new URL(window.location.href);
    if (url.searchParams.has("card")) {
      url.searchParams.delete("card");
      url.searchParams.set("tab", "cards");
      window.history.replaceState(null, "", url);
    }
  }

  function deleteOpenCard() {
    onDeleteCard(openCardId);
    closeCard();
  }

  const normalizedSearch = search.trim().toLowerCase();
  // 역량을 뺀 나머지 필터의 결과다. 드롭다운의 카드 수도 이 목록에서 세어 고른 뒤의 결과와 맞춘다.
  const candidateCards = cards.filter(
    (card) =>
      (type === ALL || card.type === type) &&
      (week === undefined || card.week === week) &&
      matchesSearch(card, normalizedSearch),
  );
  const visibleCards =
    competency === ALL
      ? candidateCards
      : candidateCards.filter(({ tags }) => tags.includes(competency));

  return (
    <section aria-label="스토리 카드" className="flex flex-col gap-4 pt-5">
      <div className="flex items-center gap-2">
        <div role="group" aria-label="카드 유형" className="flex shrink-0 gap-2">
          {TYPE_FILTERS.map(({ id, label }) => (
            <Chip key={id} selected={id === type} onClick={() => setType(id)}>
              {label}
            </Chip>
          ))}
        </div>
        <select
          aria-label="역량"
          value={competency}
          onChange={(event) => setCompetency(event.target.value)}
          className={`w-[163px] shrink-0 cursor-pointer appearance-none bg-[url(/images/my-record/chevron-down.svg)] bg-[position:right_6px_center] bg-no-repeat pr-7 pl-4 ${FIELD_CLASSES}`}
        >
          <option value={ALL}>역량 전체</option>
          {competencies.map((name) => {
            const count = candidateCards.filter(({ tags }) => tags.includes(name)).length;

            return (
              <option key={name} value={name} disabled={count === 0}>
                #{name} ({count})
              </option>
            );
          })}
        </select>
        <input
          aria-label="카드 검색"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="검색"
          className={`min-w-0 flex-1 px-3.5 placeholder:text-placeholder ${FIELD_CLASSES}`}
        />
      </div>

      {week !== undefined && (
        <Link
          href="/my-record?tab=cards"
          scroll={false}
          aria-label={`${week}주차 필터 해제`}
          className="flex h-9 w-fit items-center rounded-full border border-ink bg-ink px-3.5 text-body-sm text-white"
        >
          {week}주차만 보는 중 ×
        </Link>
      )}

      {visibleCards.length > 0 ? (
        <StoryCardList
          cards={visibleCards}
          highlightedCardId={highlightedCardId}
          onOpenCard={setOpenCardId}
        />
      ) : (
        <p role="status" className="rounded-[20px] border border-dashed border-[#d7d3cb] p-6 text-center text-body text-ink-subtle">
          조건에 맞는 카드가 없어요.
        </p>
      )}

      <Modal
        open={Boolean(openCard)}
        onClose={closeCard}
        size="lg"
        aria-labelledby="story-card-title"
      >
        {openCard && (
          <StoryCardDetail
            card={openCard}
            competencies={competencies}
            titleId="story-card-title"
            onClose={closeCard}
            onDelete={deleteOpenCard}
            onUpdate={(changes) => onUpdateCard(openCardId, changes)}
          />
        )}
      </Modal>
    </section>
  );
}
