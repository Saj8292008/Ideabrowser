# Distillery

Research agents that turn any field into training data for your own expert AI model.

1. **Research** – a planner splits the domain into sub-topics; researcher agents use Claude's web search and fetch tools to read authoritative sources.
2. **Verify** – an extractor turns notes into atomic, sourced findings; a reviewer agent scores each 1–5 and recommends keep/reject. You approve what goes in.
3. **Distill** – approved findings become supervised fine-tuning examples plus a held-out eval set, exported as JSONL in the chat `messages` format.
4. **Train** – (next) one-click LoRA fine-tune of an open model, scored on the eval set.

All agents run on `claude-opus-5-5`, with server-side refusal fallbacks enabled.

## Run it

```bash
npm install
npm run build
ANTHROPIC_API_KEY=sk-ant-... npm start      # http://localhost:8787
```

- Without `ANTHROPIC_API_KEY`, the app runs in **demo mode**: it replays a pre-researched FDA 510(k) run with real source URLs, which costs nothing.
- Development: `npm run dev` (Vite on :5173, proxying the API on :8787).
- Data (projects and the waitlist) is stored as JSON in `./data` (override with `DATA_DIR`). Use a persistent disk in production.

## Cost

A live run is billed to your Anthropic account. A 4-topic run is typically a few dollars: Opus 5.5 tokens plus about $10 per 1,000 web searches. Each project shows a running cost estimate.

## Deploy

This is a Node server, not a static site. Deploy it to any Node host (Render, Railway, Fly.io) with `npm run build` as the build command and `npm start` as the start command. Set `ANTHROPIC_API_KEY` as a secret and mount a persistent volume at `DATA_DIR`.

## Layout

- `server/claude.js` – Claude API wrappers (structured JSON calls, web research loop with `pause_turn` handling, cost tracking)
- `server/agents.js` – planner, researcher, extractor, reviewer and distiller prompts
- `server/mock.js` – demo-mode agents
- `server/pipeline.js` – project store and orchestration, with live events over SSE
- `src/` – React landing page (`/`) and workspace (`/app`)
