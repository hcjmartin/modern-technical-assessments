export const API_URL = "http://localhost:8787";

export async function generateCaption(prompt: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(`generation failed (${res.status})`);
  const data = await res.json();
  return data.text;
}
