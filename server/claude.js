// Thin wrappers around the Claude API used by every agent.
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

export const MODEL = 'claude-opus-5-5';
// Opus 5.5 list price, USD per token, plus web search ($10 / 1k searches).
const PRICE = { input: 4 / 1e6, output: 20 / 1e6, cacheRead: 0.2 / 1e6, search: 10 / 1000 };

// Server-side refusal fallback: if Opus 5.5 declines, the API re-runs the
// request on a fallback model inside the same call.
const FALLBACK = { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' };

export function hasCredentials() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

let client;
function getClient() {
  if (!client) client = new Anthropic({ maxRetries: 3 });
  return client;
}

export function costOf(usage) {
  if (!usage) return 0;
  const searches = usage.server_tool_use?.web_search_requests ?? 0;
  return (usage.input_tokens ?? 0) * PRICE.input
    + (usage.cache_read_input_tokens ?? 0) * PRICE.cacheRead
    + (usage.cache_creation_input_tokens ?? 0) * PRICE.input * 1.25
    + (usage.output_tokens ?? 0) * PRICE.output
    + searches * PRICE.search;
}

function checkStop(msg, label) {
  if (msg.stop_reason === 'refusal') {
    throw new Error(`${label}: the model declined this request (${msg.stop_details?.category ?? 'no category'}).`);
  }
  if (msg.stop_reason === 'max_tokens') {
    throw new Error(`${label}: response hit the token limit before finishing.`);
  }
}

/**
 * One structured call: returns JSON validated against `schema` (a zod object).
 */
export async function callJSON({ label, system, prompt, schema, effort = 'medium', onUsage }) {
  const jsonSchema = z.toJSONSchema(schema, { target: 'draft-2020-12' });
  delete jsonSchema.$schema;
  const stream = getClient().beta.messages.stream({
    ...FALLBACK,
    model: MODEL,
    max_tokens: 64000,
    system,
    messages: [{ role: 'user', content: prompt }],
    output_config: { effort, format: { type: 'json_schema', schema: jsonSchema } },
  });
  const msg = await stream.finalMessage();
  onUsage?.(msg.usage);
  checkStop(msg, label);
  const text = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`${label}: model returned invalid JSON.`);
  }
  return schema.parse(data);
}

/**
 * Open-ended web research with Claude's server-side web search + fetch.
 * Returns the written notes and the list of sources Claude actually read.
 */
export async function research({ system, prompt, onUsage, onProgress, maxSearches = 6 }) {
  const tools = [
    { type: 'web_search_20260209', name: 'web_search', max_uses: maxSearches },
    { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 4 },
  ];
  const messages = [{ role: 'user', content: prompt }];
  const notes = [];
  const sources = new Map();

  for (let turn = 0; turn < 5; turn++) {
    const stream = getClient().beta.messages.stream({
      ...FALLBACK,
      model: MODEL,
      max_tokens: 64000,
      system,
      tools,
      messages,
      output_config: { effort: 'medium' },
    });
    const msg = await stream.finalMessage();
    onUsage?.(msg.usage);

    for (const block of msg.content) {
      if (block.type === 'server_tool_use' && block.name === 'web_search') {
        onProgress?.(`Searching: “${block.input?.query ?? ''}”`);
      } else if (block.type === 'server_tool_use' && block.name === 'web_fetch') {
        onProgress?.(`Reading: ${block.input?.url ?? ''}`);
      } else if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
        for (const r of block.content) {
          if (r.type === 'web_search_result') sources.set(r.url, { url: r.url, title: r.title });
        }
      } else if (block.type === 'web_fetch_tool_result' && block.content?.type === 'web_fetch_result') {
        const url = block.content.url;
        sources.set(url, { url, title: block.content.content?.title ?? url });
      } else if (block.type === 'text') {
        let text = block.text;
        for (const c of block.citations ?? []) {
          if (c.url) {
            sources.set(c.url, sources.get(c.url) ?? { url: c.url, title: c.title ?? c.url });
            text += ` [source: ${c.url}]`;
          }
        }
        notes.push(text);
      }
    }

    if (msg.stop_reason === 'pause_turn') {
      // Server-side tool loop paused; send the turn back and it resumes.
      messages.push({ role: 'assistant', content: msg.content });
      continue;
    }
    checkStop(msg, 'Researcher');
    break;
  }
  return { notes: notes.join('\n'), sources: [...sources.values()] };
}

export function describeError(err) {
  if (err instanceof Anthropic.AuthenticationError) return 'Invalid Anthropic API key.';
  if (err instanceof Anthropic.RateLimitError) return 'Rate limited by the Claude API. Try again in a minute.';
  if (err instanceof Anthropic.APIError) return `Claude API error ${err.status}: ${err.message}`;
  return err?.message ?? String(err);
}
