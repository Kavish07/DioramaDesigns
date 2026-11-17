import type { ImageGenerationAdapter } from "./adapter";
import { OpenAIImageAdapter } from "./openai";

export type { GenerationRequest, GeneratedImage, ImageGenerationAdapter } from "./adapter";

// Single call site for picking a provider — add a branch here (never at
// individual call sites) when a second provider is wired up.
export function getImageGenerationAdapter(): ImageGenerationAdapter {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAIImageAdapter(apiKey);
}

export const DEFAULT_MODEL = "gpt-image-1";
export const MAX_VARIATIONS_PER_JOB = 4;
