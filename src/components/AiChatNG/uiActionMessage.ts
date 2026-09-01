/**
 * Reads page actions out of an assistant reply.
 *
 * The backend decides which tools a model gets, and it has no channel for a
 * front-end tool call — the reply is plain text. So the model is asked, in the
 * message the entry button pre-fills, to emit a fenced `fc-action` block, and
 * this module pulls those blocks back out. Everything else in the reply is
 * still prose and is still rendered as markdown.
 *
 * This is a prompt convention standing in for function calling. It is the
 * layer that gets deleted once the backend can carry tool calls itself; the
 * runtime, the registry and the action definitions behind it do not change
 * when that happens.
 */

/** The fence language the model is told to use. */
export const UI_ACTION_FENCE_LANG = 'fc-action';

export interface UIActionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface UIActionTextSegment {
  kind: 'text';
  content: string;
}

export interface UIActionCallSegment {
  kind: 'action';
  /** Raw fence body, shown to the user when it cannot be parsed. */
  raw: string;
  /**
   * Whether the closing fence has arrived.
   *
   * Load-bearing while streaming: half a JSON object must not be offered as
   * something the user can run.
   */
  closed: boolean;
  call: UIActionCall | null;
  /** Why `call` is null, when the block is closed but unusable. */
  error?: string;
}

export type UIActionSegment = UIActionTextSegment | UIActionCallSegment;

const OPEN_FENCE = new RegExp(`^[ \\t]{0,3}\`{3,}[ \\t]*${UI_ACTION_FENCE_LANG}[ \\t]*$`);
const CLOSE_FENCE = /^[ \t]{0,3}`{3,}[ \t]*$/;

/**
 * Splits a reply into prose and action blocks, in the order they appear.
 *
 * A reply with no action block comes back as a single text segment, so the
 * common case renders exactly as it did before.
 */
export function splitUIActionSegments(content: string): UIActionSegment[] {
  const segments: UIActionSegment[] = [];
  const pendingText: string[] = [];
  let body: string[] | null = null;

  const flushText = () => {
    const text = pendingText.join('\n');
    pendingText.length = 0;
    // Whitespace between two blocks is not a paragraph; rendering it would
    // add an empty markdown container and its margins.
    if (text.trim()) segments.push({ kind: 'text', content: text });
  };

  for (const line of content.split('\n')) {
    if (body === null) {
      if (OPEN_FENCE.test(line)) {
        flushText();
        body = [];
        continue;
      }
      pendingText.push(line);
      continue;
    }

    if (CLOSE_FENCE.test(line)) {
      segments.push(parseActionBlock(body.join('\n'), true));
      body = null;
      continue;
    }
    body.push(line);
  }

  // An unterminated fence is the normal state mid-stream, not an error.
  if (body !== null) segments.push(parseActionBlock(body.join('\n'), false));
  else flushText();

  return segments;
}

function parseActionBlock(raw: string, closed: boolean): UIActionCallSegment {
  if (!closed) return { kind: 'action', raw, closed, call: null };

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return { kind: 'action', raw, closed, call: null, error: describe(err) };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { kind: 'action', raw, closed, call: null, error: 'expected a JSON object' };
  }

  // `action`/`args` is what the model is asked for; `name`/`arguments` is what
  // it reaches for anyway, having seen a thousand function-calling payloads.
  // Accepting both costs one line and removes a whole class of retry.
  const name = pickString(parsed.action) ?? pickString(parsed.name);
  if (!name) return { kind: 'action', raw, closed, call: null, error: 'missing "action"' };

  const rawArgs = parsed.args ?? parsed.arguments ?? {};
  if (typeof rawArgs !== 'object' || rawArgs === null || Array.isArray(rawArgs)) {
    return { kind: 'action', raw, closed, call: null, error: '"args" must be a JSON object' };
  }

  return { kind: 'action', raw, closed, call: { name, args: rawArgs as Record<string, unknown> } };
}

function pickString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function describe(err: unknown): string {
  return err instanceof Error ? err.message : 'invalid JSON';
}
