import type { VideoRef } from "@/content/types";

function embedUrl(v: VideoRef) {
  const params = new URLSearchParams();
  if (v.start) params.set("start", String(v.start));
  if (v.end) params.set("end", String(v.end));
  const query = params.toString();
  return `https://www.youtube-nocookie.com/embed/${v.youtubeId}${query ? `?${query}` : ""}`;
}

export function VideoList({ videos }: { videos: readonly VideoRef[] }) {
  return (
    <div className="space-y-6">
      {videos.map((v) => (
        <figure key={v.youtubeId} className="space-y-2">
          <div className="aspect-video overflow-hidden rounded-lg border border-border bg-subtle">
            <iframe
              src={embedUrl(v)}
              title={v.title}
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="size-full"
            />
          </div>
          <figcaption className="space-y-1 text-sm">
            <p className="font-medium">
              {v.title} <span className="text-muted">· {v.channel} · {v.lang === "es" ? "Español" : "Inglés"}</span>
            </p>
            <p className="text-muted">
              <span className="font-medium text-foreground">En qué fijarte:</span> {v.focus}
            </p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
