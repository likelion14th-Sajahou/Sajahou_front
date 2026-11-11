import Link from "next/link";
import { STORY_CARD_TYPES } from "@/components/my-record/storyCardTypes";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextLink from "@/components/ui/TextLink";
import SectionHeader from "./SectionHeader";
import { homeCardHref } from "@/lib/homeViewModel";

export default function RecentRetrospectives({ items }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4 pt-8">
      <SectionHeader
        title="최근 회고"
        action={
          <TextLink variant="border" href="/my-record?tab=cards">
            전체
          </TextLink>
        }
      />
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {items.map(({ id, title, type, shape, color }) => (
          <li key={id}>
            <Card as={Link} href={homeCardHref(id)} size="xs" className="flex h-full items-center gap-3">
              <ShapeCharacter shape={shape} color={color} face="none" size={26} />
              <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                <span className="w-full truncate text-body leading-[21px] text-ink">
                  {title}
                </span>
                <Badge tone={STORY_CARD_TYPES[type].tone}>{STORY_CARD_TYPES[type].label}</Badge>
              </span>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
