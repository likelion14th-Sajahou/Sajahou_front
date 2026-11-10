"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import StoryCardList from "./StoryCardList";
import RemoteStoryCard from "./RemoteStoryCard";
import { getStoryCards } from "@/lib/myRecordApi";
import { cardView } from "@/lib/projectViewModel";
import useRecordResource from "./useRecordResource";
import RecordRequestStatus from "./RecordRequestStatus";
import { recordHref, resolveRecordCompetency } from "@/lib/myRecordNavigation";

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

export default function StoryCardsPanel({
  cards,
  competencyItems,
  userId,
  location,
  searchParams,
  onNavigate,
  onChanged,
  revision,
}) {
  const { type, week, q: search, card: openCardId } = location;
  const [expiredHighlight, setExpiredHighlight] = useState(null);
  const highlightToken = `${userId}:${searchParams.toString()}`;
  const highlightedCardId = expiredHighlight === highlightToken ? undefined : location.highlight;

  function closeCard() {
    onNavigate({ card: null, tab: "cards" }, true);
  }

  const { id: competencyId, invalid: invalidCompetency } = resolveRecordCompetency(location, competencyItems);
  const query = JSON.stringify({ type: type === ALL ? undefined : type.toUpperCase(), competencyId, weekNumber: week, q: search.trim() || undefined });
  const load = useCallback((signal) => getStoryCards(JSON.parse(query), { signal }), [query]);
  const filtered = useRecordResource(load, invalidCompetency || query === "{}" ? null : `${userId}:${revision}:${query}`, search ? 250 : 0);
  const visibleCards = invalidCompetency ? [] : query === "{}" ? cards : filtered.data?.cards.map(cardView) ?? [];
  const visibleIds = visibleCards.map((card) => card.id).join(",");
  useEffect(() => {
    if (!highlightedCardId || filtered.loading) return;
    const element = document.getElementById(`story-card-${highlightedCardId}`);
    if (!element) return;
    element.scrollIntoView({ block: "center" });
    const timer = setTimeout(() => setExpiredHighlight(highlightToken), HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [highlightedCardId, highlightToken, visibleIds, filtered.loading]);

  return (
    <section aria-label="스토리 카드" className="flex flex-col gap-4 pt-5">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="카드 유형" className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map(({ id, label }) => (
            <Chip key={id} selected={id === type} onClick={() => onNavigate({ type: id, card: null })}>
              {label}
            </Chip>
          ))}
        </div>
        <select
          aria-label="역량"
          value={invalidCompetency ? "invalid" : competencyId == null ? ALL : String(competencyId)}
          onChange={(event) => onNavigate({ competencyId: event.target.value, tag: null, card: null })}
          className={`w-[163px] shrink-0 cursor-pointer appearance-none bg-[url(/images/common/chevron-down.svg)] bg-[position:right_6px_center] bg-no-repeat pr-7 pl-4 ${FIELD_CLASSES}`}
        >
          <option value={ALL}>역량 전체</option>
          {invalidCompetency && <option value="invalid" disabled>선택한 역량을 찾을 수 없어요</option>}
          {competencyItems.map(({ id, name, cardCount: count }) => {

            return (
              <option key={id} value={String(id)} disabled={count === 0}>
                #{name} ({count})
              </option>
            );
          })}
        </select>
        <input
          aria-label="카드 검색"
          value={search}
          onChange={(event) => onNavigate({ q: event.target.value, card: null }, true)}
          placeholder="검색"
          className={`min-w-[120px] flex-1 px-3.5 placeholder:text-placeholder ${FIELD_CLASSES}`}
        />
      </div>

      {week !== undefined && (
        <Link
          href={recordHref(searchParams, { week: null })}
          scroll={false}
          aria-label={`${week}주차 필터 해제`}
          className="flex h-9 w-fit items-center rounded-full border border-ink bg-ink px-3.5 text-body-sm text-white"
        >
          {week}주차만 보는 중 ×
        </Link>
      )}

      {highlightedCardId && !filtered.loading && !filtered.error && !visibleCards.some((card) => card.id === highlightedCardId) && (
        <p role="status" className="text-body-sm text-ink-muted">강조할 카드가 현재 목록에 없어요.</p>
      )}

      {filtered.loading || filtered.error ? <RecordRequestStatus resource={filtered}>조건에 맞는 카드를 불러오는 중이에요.</RecordRequestStatus> : visibleCards.length > 0 ? (
        <StoryCardList
          cards={visibleCards}
          highlightedCardId={highlightedCardId}
          onOpenCard={(card) => onNavigate({ card, tab: "cards" })}
        />
      ) : (
        <EmptyState role="status">조건에 맞는 카드가 없어요.</EmptyState>
      )}

      <Modal
        open={Boolean(openCardId)}
        onClose={closeCard}
        size="lg"
        aria-labelledby="story-card-title"
      >
        {openCardId && <RemoteStoryCard key={openCardId} cardId={openCardId}
          competencyItems={competencyItems} titleId="story-card-title" onClose={closeCard} onChanged={onChanged} />}
      </Modal>
    </section>
  );
}
