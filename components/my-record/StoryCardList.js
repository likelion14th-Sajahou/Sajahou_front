import StoryCard from "./StoryCard";

export default function StoryCardList({ cards }) {
  return (
    <ul aria-label="스토리 카드" className="mt-5 grid grid-cols-3 gap-4">
      {cards.map((card) => (
        <li key={card.id}>
          <StoryCard card={card} />
        </li>
      ))}
    </ul>
  );
}
