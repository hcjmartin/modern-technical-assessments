/** Mock caption API. No dependencies beyond Node. */
import http from "node:http";
import { generate } from "./model";

const PORT = Number(process.env.PORT ?? 8787);

function send(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readJson(req: http.IncomingMessage): Promise<any> {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.writeHead(204).end();

  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  // POST /api/generate {prompt} -> {text}, once the whole generation has finished.
  if (req.method === "POST" && url.pathname === "/api/generate") {
    const { prompt } = await readJson(req);
    if (typeof prompt !== "string" || !prompt.trim()) return send(res, 400, { error: "prompt is required" });
    try {
      return send(res, 200, { text: await generate(prompt) });
    } catch {
      return send(res, 500, { error: "generation failed" });
    }
  }

  send(res, 404, { error: "not found" });
});

server.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
