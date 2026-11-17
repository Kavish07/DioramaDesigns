// Versioned prompt data (CLAUDE.md: "phrase map and template are versioned
// data (not inline code) so old images stay reproducible after the template
// changes"). Bump TEMPLATE_VERSION whenever TEMPLATE or any phrase below
// changes meaning, not just wording — it's stored on every diorama row via
// the `model` field's companion `prompt`/`negative_prompt` text, so old rows
// keep their original rendered prompt regardless of future edits here.
export const TEMPLATE_VERSION = 1;

export const TEMPLATE =
  "A {scale} {category} diorama of a {theme} scene set in the {era}, {realism}, seen from {pov}. Tabletop miniature photography, shallow depth of field, soft studio lighting, on a display base. {extra}";

export const DEFAULT_NEGATIVE_PROMPT =
  "blurry, distorted, text, logo, watermark";

export const CATEGORY_PHRASES: Record<string, string> = {
  lego: "brick-built",
  gundam: "mecha model kit",
  cars: "die-cast miniature car",
};

export const POV_OPTIONS = [
  { value: "eye-level", label: "Eye-level", phrase: "eye-level" },
  { value: "low-angle", label: "Low angle", phrase: "a low angle" },
  { value: "high-angle", label: "High angle (bird's eye)", phrase: "a high angle" },
  { value: "macro", label: "Macro close-up", phrase: "a macro close-up" },
];

export const REALISM_OPTIONS = [
  { value: "photoreal", label: "Photoreal", phrase: "photorealistic rendering" },
  { value: "stylized", label: "Stylized", phrase: "stylized illustrative rendering" },
];

export const ERA_OPTIONS = [
  { value: "present-day", label: "Present day", phrase: "present day" },
  { value: "near-future", label: "Near future", phrase: "near future" },
  { value: "far-future", label: "Far future", phrase: "far future" },
  { value: "post-collapse", label: "Post-collapse", phrase: "post-collapse future" },
  { value: "retro", label: "Retro", phrase: "a retro-futuristic past" },
];

function lookupPhrase(
  options: { value: string; phrase: string }[],
  value: string
): string {
  return options.find((o) => o.value === value)?.phrase ?? value;
}

export function buildPrompt(input: {
  category: string;
  scaleName: string;
  themeName: string;
  pov: string;
  realism: string;
  era: string;
  extraDetails?: string;
}): { prompt: string; negativePrompt: string } {
  const prompt = TEMPLATE.replace("{scale}", input.scaleName)
    .replace("{category}", CATEGORY_PHRASES[input.category] ?? input.category)
    .replace("{theme}", input.themeName.toLowerCase())
    .replace("{era}", lookupPhrase(ERA_OPTIONS, input.era))
    .replace("{realism}", lookupPhrase(REALISM_OPTIONS, input.realism))
    .replace("{pov}", lookupPhrase(POV_OPTIONS, input.pov))
    .replace("{extra}", input.extraDetails?.trim() ?? "")
    .replace(/\s+/g, " ")
    .trim();

  return { prompt, negativePrompt: DEFAULT_NEGATIVE_PROMPT };
}
