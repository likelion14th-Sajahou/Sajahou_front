"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import Link from "next/link";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import DrawnBorder from "@/components/ui/DrawnBorder";
import TextField from "@/components/ui/TextField";
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
  "h-[38px] rounded-full border border-transparent bg-white text-body-sm text-[#1f2433]";

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
  const { authenticatedRequest } = useAuth();
  const { type, week, q: search, card: openCardId } = location;
  const [expiredHighlight, setExpiredHighlight] = useState(null);
  const highlightToken = `${userId}:${searchParams.toString()}`;
  const highlightedCardId = expiredHighlight === highlightToken ? undefined : location.highlight;

  function closeCard() {
    onNavigate({ card: null, tab: "cards" }, true);
  }

  const { id: competencyId, invalid: invalidCompetency } = resolveRecordCompetency(location, competencyItems);
  const selectedCompetency = competencyItems.find(({ id }) => String(id) === String(competencyId));
  const competencyLabel = invalidCompetency ? "선택한 역량을 찾을 수 없어요"
    : selectedCompetency ? `#${selectedCompetency.name} (${selectedCompetency.cardCount})` : "역량 전체";
  const query = JSON.stringify({ type: type === ALL ? undefined : type.toUpperCase(), competencyId, weekNumber: week, q: search.trim() || undefined });
  const load = useCallback((signal) => getStoryCards(JSON.parse(query), { signal, request: authenticatedRequest }), [query, authenticatedRequest]);
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
    <section aria-label="스토리 카드" className="flex min-w-0 flex-col gap-4 pt-5 font-display">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="카드 유형" className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map(({ id, label }) => (
            <Chip key={id} drawn className="h-[38px]! px-4! [--drawn-border-height:38px]!" selected={id === type} onClick={() => onNavigate({ type: id, card: null })}>
              {label}
            </Chip>
          ))}
        </div>
        <div className="relative w-[159px] shrink-0 [--drawn-border-height:38px]">
          <DrawnBorder variant="chip-line" repeat="round" color="var(--color-line)" />
          <select
            aria-label="역량"
            value={invalidCompetency ? "invalid" : competencyId == null ? ALL : String(competencyId)}
            onChange={(event) => onNavigate({ competencyId: event.target.value, tag: null, card: null })}
            className={`w-full cursor-pointer appearance-none text-transparent! [&_option]:text-ink ${FIELD_CLASSES}`}
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
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center px-7 text-body-sm text-[#1f2433]">
            <span className="relative min-w-0 max-w-full">
              <span className="absolute top-1/2 right-full mr-1 h-2 w-3 -translate-y-1/2 bg-[url(/images/common/chevron-down.svg)] bg-contain bg-center bg-no-repeat" />
              <span className="block truncate">{competencyLabel}</span>
            </span>
          </span>
        </div>
        <div className="relative min-w-[120px] flex-1 [--drawn-border-height:38px]">
          <DrawnBorder variant="chip-line" repeat="round" color="var(--color-line)" />
          <TextField
            size="sm"
            aria-label="카드 검색"
            value={search}
            onChange={(event) => onNavigate({ q: event.target.value, card: null }, true)}
            placeholder="검색"
            className="rounded-full! border-transparent! bg-white! px-3.5! text-body-sm! text-[#1f2433] placeholder:text-[#8a8f9a]"
          />
        </div>
      </div>

      {week !== undefined && (
        <Link
          href={recordHref(searchParams, { week: null })}
          scroll={false}
          aria-label={`${week}주차 필터 해제`}
          className="relative flex h-9 w-fit items-center rounded-full bg-ink px-3.5 text-body-sm text-white [--drawn-border-height:36px]"
        >
          <DrawnBorder variant="chip-ink" />
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
        <EmptyState role="status" className="py-8!">조건에 맞는 카드가 없어요.</EmptyState>
      )}

      <Modal
        open={Boolean(openCardId)}
        onClose={closeCard}
        size="lg"
        className="overflow-visible! rounded-[20px]! font-display text-[#1f2433] backdrop:bg-ink/40"
        contentClassName="max-h-[calc(100dvh-32px)] overflow-y-auto rounded-[20px] px-5 py-7 sm:px-[30px]"
        border={<DrawnBorder variant="thin-outline" repeat="round" color="var(--color-ink)" />}
        aria-labelledby="story-card-title"
      >
        {openCardId && <RemoteStoryCard key={openCardId} cardId={openCardId}
          competencyItems={competencyItems} titleId="story-card-title" onClose={closeCard} onChanged={onChanged} />}
      </Modal>
    </section>
  );
}
