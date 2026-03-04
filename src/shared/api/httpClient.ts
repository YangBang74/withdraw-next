export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpRequestOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
};

export class HttpError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.payload = payload;
  }
}

export async function httpRequest<TResponse>(
  url: string,
  options: HttpRequestOptions = {},
): Promise<TResponse> {
  const { method = "GET", headers, body } = options;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json: unknown = null;
  const anyResponse = response as any;

  if (typeof anyResponse.text === "function") {
    const text = await anyResponse.text();
    json = text ? safeJsonParse(text) : null;
  } else if (typeof anyResponse.json === "function") {
    json = await anyResponse.json();
  }

  if (!response.ok) {
    const message =
      typeof (json as any)?.message === "string"
        ? (json as any).message
        : `Request to ${url} failed with status ${response.status}`;

    throw new HttpError(message, response.status, json);
  }

  return json as TResponse;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

