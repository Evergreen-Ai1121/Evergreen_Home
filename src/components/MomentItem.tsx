import { thumbUrl, type Moment } from "@/lib/moments";
import { GlassCard } from "./GlassCard";
import { ImageWall } from "./ImageWall";
import { LocalDate } from "./LocalDate";
import { MomentContent } from "./MomentContent";

export function MomentItem({ moment }: { moment: Moment }) {
  return (
    <GlassCard id={`moment-${moment.id}`} className="scroll-mt-24 p-5">
      <div className="text-[15px] leading-relaxed">
        <MomentContent content={moment.content} />
      </div>
      {moment.images.length > 0 && (
        <ImageWall
          images={moment.images.map((img) => ({
            src: img.url,
            thumb: thumbUrl(img.url),
            alt: img.alt || "",
          }))}
        />
      )}
      <LocalDate
        date={moment.createdAt}
        variant="dateTime"
        className="mt-4 inline-block rounded-pill bg-surface-strong px-2.5 py-0.5 text-xs text-text-muted"
      />
    </GlassCard>
  );
}
