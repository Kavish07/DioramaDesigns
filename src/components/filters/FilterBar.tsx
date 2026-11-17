"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types/database";

const CATEGORIES: Category[] = ["lego", "gundam", "cars"];

export function FilterBar({
  scales,
  themes,
}: {
  scales: { id: string; name: string }[];
  themes: { id: string; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const scale = searchParams.get("scale") ?? "";
  const theme = searchParams.get("theme") ?? "";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    // Scale options are category-dependent — a category change invalidates
    // whatever scale was selected.
    if (key === "category") params.delete("scale");
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={category}
        onChange={(e) => setParam("category", e.target.value)}
        className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={scale}
        onChange={(e) => setParam("scale", e.target.value)}
        disabled={scales.length === 0}
        className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <option value="">All scales</option>
        {scales.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        value={theme}
        onChange={(e) => setParam("theme", e.target.value)}
        className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <option value="">All themes</option>
        {themes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
