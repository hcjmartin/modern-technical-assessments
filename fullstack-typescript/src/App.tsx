import { useState } from "react";
import { generateCaption } from "./api";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await generateCaption(prompt));
    } catch {
      setError("Something went wrong.");
      setPrompt("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Caption generator</h1>
      <textarea
        id="prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your video, e.g. a sunset timelapse over London"
        rows={3}
      />
      <button id="generate" onClick={onGenerate}>
        Generate
      </button>
      {loading && <p className="muted">Generating…</p>}
      {error && <p id="error" className="error">{error}</p>}
      {result && <pre id="result">{result}</pre>}
    </main>
  );
}
