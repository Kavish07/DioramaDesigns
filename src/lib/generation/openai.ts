import type {
  GenerationRequest,
  GeneratedImage,
  ImageGenerationAdapter,
} from "./adapter";

// shortcut: gpt-image-1 has no `seed` parameter (unlike dall-e-2/3), so
// generations aren't literally reproducible from the stored seed yet — only
// the prompt/model are. Revisit if a seed-capable model is added.
const ASPECT_TO_SIZE: Record<string, string> = {
  square: "1024x1024",
  landscape: "1536x1024",
  portrait: "1024x1536",
};

export class OpenAIImageAdapter implements ImageGenerationAdapter {
  constructor(private apiKey: string) {}

  async generate(request: GenerationRequest): Promise<GeneratedImage[]> {
    const size = ASPECT_TO_SIZE[request.aspectRatio ?? "square"] ?? "1024x1024";
    const n = Math.min(Math.max(request.variationCount ?? 1, 1), 4);

    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: request.model,
        prompt: request.negativePrompt
          ? `${request.prompt} (avoid: ${request.negativePrompt})`
          : request.prompt,
        size,
        n,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenAI image generation failed (${res.status}): ${body}`);
    }

    const json = (await res.json()) as { data: { b64_json: string }[] };
    const seedBase = request.seed ?? Math.floor(Math.random() * 1_000_000);

    return json.data.map((item, i) => ({
      url: `data:image/png;base64,${item.b64_json}`,
      seed: seedBase + i,
      model: request.model,
    }));
  }
}
