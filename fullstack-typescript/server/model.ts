/**
 * Simulated generative model. Don't change the timing in this file:
 * generation can't be made faster. Everything else in the repo is yours to change.
 */
export const STAGES = [
  { name: "Reading your prompt", ms: 1500 },
  { name: "Drafting caption ideas", ms: 4000 },
  { name: "Polishing", ms: 2500 },
] as const;

const FAIL_RATE = 0.15; // share of generations that fail. Prompts containing "fail" always fail.

export type StageUpdate = { index: number; total: number; name: string; expectedMs: number };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function draft(prompt: string): string {
  const topic = prompt.trim().slice(0, 80);
  return [
    `Hook: "Nobody tells you this about ${topic}."`,
    `Caption: Three seconds in and you're hooked. ${topic}, but not the way you've seen it before.`,
    `On-screen text: Wait for it.`,
    `Hashtags: #fyp #creative #behindthescenes`,
  ].join("\n");
}

/** Takes about 8 seconds. Calls onStage (if given) as each stage starts. */
export async function generate(prompt: string, onStage?: (stage: StageUpdate) => void): Promise<string> {
  const fails = /\bfail\b/i.test(prompt) || Math.random() < FAIL_RATE;
  const failStage = fails ? Math.floor(Math.random() * STAGES.length) : -1;
  for (const [index, stage] of STAGES.entries()) {
    onStage?.({ index, total: STAGES.length, name: stage.name, expectedMs: stage.ms });
    const jitter = 0.8 + Math.random() * 0.4; // real models vary
    await sleep(stage.ms * jitter * (index === failStage ? 0.5 : 1));
    if (index === failStage) throw new Error("model error");
  }
  return draft(prompt);
}
