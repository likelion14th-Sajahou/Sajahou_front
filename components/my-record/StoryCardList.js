import StoryCard from "./StoryCard";

export default function StoryCardList({ cards, highlightedCardId, onOpenCard }) {
  return (
    <ul aria-label="스토리 카드" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <li key={card.id} id={`story-card-${card.id}`}>
          <StoryCard card={card} isHighlighted={card.id === highlightedCardId} onOpen={onOpenCard} />
        </li>
      ))}
    </ul>
  );
}
