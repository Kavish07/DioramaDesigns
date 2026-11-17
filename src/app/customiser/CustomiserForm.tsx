"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import type { Category } from "@/types/database";
import { POV_OPTIONS, REALISM_OPTIONS, ERA_OPTIONS, buildPrompt } from "@/lib/prompt/phraseMap";
import { MAX_VARIATIONS_PER_JOB } from "@/lib/generation";
import { generateDiorama, type GenerateState } from "./actions";

const CATEGORIES: Category[] = ["lego", "gundam", "cars"];

export function CustomiserForm({
  scales,
  themes,
}: {
  scales: { id: string; category: string; name: string }[];
  themes: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<GenerateState, FormData>(
    generateDiorama,
    {}
  );
  const [category, setCategory] = useState<Category>("lego");
  const [scaleId, setScaleId] = useState("");
  const [themeId, setThemeId] = useState("");
  const [pov, setPov] = useState(POV_OPTIONS[0].value);
  const [realism, setRealism] = useState(REALISM_OPTIONS[0].value);
  const [era, setEra] = useState(ERA_OPTIONS[0].value);
  const [extraDetails, setExtraDetails] = useState("");
  const [editedPrompt, setEditedPrompt] = useState<string | null>(null);

  const scalesForCategory = useMemo(
    () => scales.filter((s) => s.category === category),
    [scales, category]
  );

  const preview = useMemo(() => {
    const scaleName = scales.find((s) => s.id === scaleId)?.name ?? "{scale}";
    const themeName = themes.find((t) => t.id === themeId)?.name ?? "{theme}";
    return buildPrompt({ category, scaleName, themeName, pov, realism, era, extraDetails }).prompt;
  }, [scales, themes, category, scaleId, themeId, pov, realism, era, extraDetails]);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <select
          name="category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as Category);
            setScaleId("");
          }}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          name="scaleId"
          value={scaleId}
          onChange={(e) => setScaleId(e.target.value)}
          required
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">Select scale…</option>
          {scalesForCategory.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          name="themeId"
          value={themeId}
          onChange={(e) => setThemeId(e.target.value)}
          required
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">Select theme…</option>
          {themes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          name="pov"
          value={pov}
          onChange={(e) => setPov(e.target.value)}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {POV_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          name="realism"
          value={realism}
          onChange={(e) => setRealism(e.target.value)}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {REALISM_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          name="era"
          value={era}
          onChange={(e) => setEra(e.target.value)}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {ERA_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <textarea
        placeholder="Extra details (optional)"
        value={extraDetails}
        onChange={(e) => setExtraDetails(e.target.value)}
        name="extraDetails"
        rows={2}
        className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
      />

      <label className="flex flex-col gap-1 text-sm text-zinc-500">
        Prompt (editable)
        <textarea
          name="prompt"
          value={editedPrompt ?? preview}
          onChange={(e) => setEditedPrompt(e.target.value)}
          rows={3}
          className="rounded border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>

      <details className="text-sm text-zinc-500">
        <summary className="cursor-pointer">Advanced</summary>
        <div className="mt-2 flex flex-wrap gap-3">
          <label className="flex items-center gap-2">
            Aspect ratio
            <select
              name="aspectRatio"
              defaultValue="square"
              className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="square">Square</option>
              <option value="landscape">Landscape</option>
              <option value="portrait">Portrait</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            Variations
            <input
              type="number"
              name="variationCount"
              defaultValue={1}
              min={1}
              max={MAX_VARIATIONS_PER_JOB}
              className="w-16 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </div>
      </details>

      <button
        type="submit"
        disabled={pending || !scaleId || !themeId}
        className="w-fit rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Generating…" : "Generate"}
      </button>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.createdCount !== undefined && !state.error && (
        <p className="text-sm text-green-600">
          Generated {state.createdCount} diorama{state.createdCount === 1 ? "" : "s"}.{" "}
          <Link href="/" className="underline">
            View in gallery
          </Link>
          .
        </p>
      )}
    </form>
  );
}
