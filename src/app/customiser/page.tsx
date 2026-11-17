import { createClient } from "@/lib/supabase/server";
import { CustomiserForm } from "./CustomiserForm";

export default async function CustomiserPage() {
  const supabase = await createClient();
  const [{ data: scales }, { data: themes }] = await Promise.all([
    supabase.from("scales").select("id, category, name").order("sort_order"),
    supabase.from("themes").select("id, name").order("name"),
  ]);

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="text-xl font-semibold">Customiser</h1>
      <CustomiserForm scales={scales ?? []} themes={themes ?? []} />
    </main>
  );
}
