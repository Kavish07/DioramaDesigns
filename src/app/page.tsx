import { createClient } from "@/lib/supabase/server";
import { FilterBar } from "@/components/filters/FilterBar";
import { DioramaCard } from "@/components/gallery/DioramaCard";

const GALLERY_PUBLIC = process.env.NEXT_PUBLIC_GALLERY_PUBLIC === "true";

export default async function GalleryPage(props: PageProps<"/">) {
  const params = await props.searchParams;
  const category = typeof params.category === "string" ? params.category : "";
  const scale = typeof params.scale === "string" ? params.scale : "";
  const theme = typeof params.theme === "string" ? params.theme : "";

  const supabase = await createClient();

  if (!GALLERY_PUBLIC) {
    const { data } = await supabase.auth.getUser();
    if (data.user?.email !== process.env.OWNER_EMAIL) {
      return (
        <main className="flex flex-1 items-center justify-center p-8">
          <p className="text-zinc-600 dark:text-zinc-400">
            This gallery is private.{" "}
            <a href="/login" className="underline">
              Sign in
            </a>
            .
          </p>
        </main>
      );
    }
  }

  const [{ data: scales }, { data: themes }, { data: dioramas }] =
    await Promise.all([
      supabase
        .from("scales")
        .select("id, name")
        .match(category ? { category } : {})
        .order("sort_order"),
      supabase.from("themes").select("id, name").order("name"),
      supabase
        .from("dioramas")
        .select("*, scales(name), themes(name)")
        .match({
          ...(category ? { category } : {}),
          ...(scale ? { scale_id: scale } : {}),
          ...(theme ? { theme_id: theme } : {}),
        })
        .order("created_at", { ascending: false })
        .limit(60),
    ]);

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <FilterBar scales={scales ?? []} themes={themes ?? []} />

      {dioramas && dioramas.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(
            // shortcut: hand-written Database type doesn't model the joined
            // scales()/themes() select shape, so the query result infers as
            // `never`; fixed once real generated types land (see
            // src/types/database.ts header).
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dioramas as any[]
          ).map((d) => (
            <DioramaCard key={d.id} diorama={d} />
          ))}
        </div>
      ) : (
        <p className="text-zinc-500">No dioramas yet.</p>
      )}
    </main>
  );
}
