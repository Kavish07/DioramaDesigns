// Contract only — no provider SDKs yet. Keeps image-generation code behind
// one interface so no call site ever hard-codes a specific provider
// (CLAUDE.md: "Keep the image-provider integration behind the adapter
// interface"). Implementations (OpenAI, Google, Flux via Replicate/fal) are
// follow-up work.

export type GenerationRequest = {
  prompt: string;
  negativePrompt?: string;
  model: string;
  aspectRatio?: string;
  seed?: number;
  variationCount?: number;
};

export type GeneratedImage = {
  url: string;
  seed: number;
  model: string;
};

export interface ImageGenerationAdapter {
  generate(request: GenerationRequest): Promise<GeneratedImage[]>;
}
