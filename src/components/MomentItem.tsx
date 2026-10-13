import { thumbUrl, type Moment } from "@/lib/moments";
import { GlassCard } from "./GlassCard";
import { ImageWall } from "./ImageWall";

function formatMomentTime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso.replace(" ", "T") + (iso.includes("Z") ? "" : "Z"));
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function MomentItem({ moment }: { moment: Moment }) {
  return (
    <GlassCard id={`moment-${moment.id}`} className="scroll-mt-24 p-5">
      <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
        {moment.content}
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
      <time
        className="mt-4 block text-xs text-text-muted"
        dateTime={moment.createdAt}
      >
        {formatMomentTime(moment.createdAt)}
      </time>
    </GlassCard>
  );
}
