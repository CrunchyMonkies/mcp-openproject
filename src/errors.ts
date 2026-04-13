export class OpenProjectError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "OpenProjectError";
    this.statusCode = statusCode;
  }
}

export async function extractErrorMessage(response: Response): Promise<string> {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    const body = await response.text().catch(() => "");
    return body.trim() || "No error body returned.";
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    if (typeof obj.message === "string" && obj.message.trim()) {
      return obj.message.trim();
    }

    const embedded = obj._embedded;
    if (embedded && typeof embedded === "object") {
      const emb = embedded as Record<string, unknown>;
      const errors = emb.errors;
      if (Array.isArray(errors)) {
        const messages: string[] = [];
        for (const err of errors) {
          if (err && typeof err === "object") {
            const msg = (err as Record<string, unknown>).message;
            if (typeof msg === "string" && msg.trim()) {
              messages.push(msg.trim());
            }
          }
        }
        if (messages.length > 0) {
          return messages.join("; ");
        }
      }
    }
  }

  return "Unexpected error format returned by server.";
}
