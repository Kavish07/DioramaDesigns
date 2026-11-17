import type { Database } from "@/types/database";

type Diorama = Database["public"]["Tables"]["dioramas"]["Row"] & {
  scales: { name: string } | null;
  themes: { name: string } | null;
};

export function DioramaCard({ diorama }: { diorama: Diorama }) {
  const image = diorama.images[0]?.url;

  return (
    <article className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      {image && (
        // shortcut: plain <img>, not next/image — image URLs are arbitrary
        // (seed data + future R2/CDN); revisit once next.config remotePatterns
        // is settled for the real image host.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={diorama.title}
          className="aspect-[4/3] w-full object-cover"
        />
      )}
      <div className="p-3">
        <h3 className="font-medium">{diorama.title}</h3>
        <p className="text-sm text-zinc-500">
          {diorama.category}
          {diorama.scales ? ` · ${diorama.scales.name}` : ""}
          {diorama.themes ? ` · ${diorama.themes.name}` : ""}
        </p>
      </div>
    </article>
  );
}
