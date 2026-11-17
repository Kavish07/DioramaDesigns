"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildPrompt } from "@/lib/prompt/phraseMap";
import {
  getImageGenerationAdapter,
  DEFAULT_MODEL,
  MAX_VARIATIONS_PER_JOB,
} from "@/lib/generation";

export type GenerateState = {
  error?: string;
  createdCount?: number;
  prompt?: string;
};

export async function generateDiorama(
  _state: GenerateState,
  formData: FormData
): Promise<GenerateState> {
  const supabase = await createClient();

  // Independent re-check — the proxy gate doesn't run for direct Server
  // Action invocations, and RLS alone would still let a bad request burn
  // API spend before failing at the DB insert.
  const { data: userData } = await supabase.auth.getUser();
  if (userData.user?.email !== process.env.OWNER_EMAIL) {
    return { error: "Not authorized." };
  }

  const category = String(formData.get("category") ?? "");
  const scaleId = String(formData.get("scaleId") ?? "");
  const themeId = String(formData.get("themeId") ?? "");
  const pov = String(formData.get("pov") ?? "eye-level");
  const realism = String(formData.get("realism") ?? "photoreal");
  const era = String(formData.get("era") ?? "present-day");
  const extraDetails = String(formData.get("extraDetails") ?? "");
  const editedPrompt = String(formData.get("prompt") ?? "").trim();
  const aspectRatio = String(formData.get("aspectRatio") ?? "square");
  const variationCount = Math.min(
    Math.max(parseInt(String(formData.get("variationCount") ?? "1"), 10) || 1, 1),
    MAX_VARIATIONS_PER_JOB
  );

  if (!category || !scaleId || !themeId) {
    return { error: "Category, scale, and theme are required." };
  }

  // shortcut: hand-written Database type doesn't give supabase-js enough to
  // infer these (same limitation noted in src/types/database.ts) — fixed
  // once real generated types land.
  const [{ data: scale }, { data: theme }] = (await Promise.all([
    supabase.from("scales").select("name").eq("id", scaleId).single(),
    supabase.from("themes").select("name").eq("id", themeId).single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ])) as any[];
  if (!scale || !theme) {
    return { error: "Invalid scale or theme." };
  }

  const { prompt: builtPrompt, negativePrompt } = buildPrompt({
    category,
    scaleName: scale.name,
    themeName: theme.name,
    pov,
    realism,
    era,
    extraDetails,
  });
  const prompt = editedPrompt || builtPrompt;

  let images;
  try {
    const adapter = getImageGenerationAdapter();
    images = await adapter.generate({
      prompt,
      negativePrompt,
      model: DEFAULT_MODEL,
      aspectRatio,
      variationCount,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Generation failed." };
  }

  let createdCount = 0;
  for (const image of images) {
    const base64 = image.url.split(",")[1];
    const path = `${randomUUID()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("dioramas")
      .upload(path, Buffer.from(base64, "base64"), { contentType: "image/png" });
    if (uploadError) continue;

    const { data: publicUrl } = supabase.storage.from("dioramas").getPublicUrl(path);

    const { error: insertError } = await supabase.from("dioramas").insert({
      title: `${theme.name} ${category}`,
      category,
      scale_id: scaleId,
      theme_id: themeId,
      pov,
      realism,
      era,
      prompt,
      negative_prompt: negativePrompt,
      model: image.model,
      seed: image.seed,
      images: [{ angle: "front", url: publicUrl.publicUrl }],
      source: "generated",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    if (!insertError) createdCount++;
  }

  if (createdCount === 0) {
    return { error: "Generated images but failed to save them." };
  }

  revalidatePath("/");
  return { createdCount, prompt };
}
