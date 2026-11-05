import StoryCard from "./StoryCard";

export default function StoryCardList({ cards, highlightedCardId, onOpenCard }) {
  return (
    <ul aria-label="스토리 카드" className="grid grid-cols-3 gap-4">
      {cards.map((card) => (
        <li key={card.id} id={`story-card-${card.id}`}>
          <StoryCard card={card} isHighlighted={card.id === highlightedCardId} onOpen={onOpenCard} />
        </li>
      ))}
    </ul>
  );
}
