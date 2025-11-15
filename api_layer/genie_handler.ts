import { startGenieConversation } from "./routes/start_conversation.ts";
import { getGenieMessage } from "./routes/get_message.ts";
import { streamConversation } from "./routes/stream_conversation.ts";
import {
  DatabricksGetMessageRequest,
  DatabricksStartConversationRequest,
  DatabricksStreamConversationRequest,
} from "./types.ts";

type RouteHandler = (req: Request) => Promise<Response>;

const routes: Record<string, RouteHandler> = {
  "POST /api/genie/start-conversation": handleStartConversation,
  "POST /api/genie/get-message": handleGetMessage,
  "POST /api/genie/stream-conversation": handleStreamConversation,
};

function json(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function handler(req: Request): Promise<Response> | Response {
  if (req.method === "OPTIONS") {
    return handlePreflight();
  }

  const url = new URL(req.url);
  const route = routes[`${req.method} ${url.pathname}`];
  if (!route) {
    return json({ error: "Not found" }, { status: 404 });
  }

  return route(req);
}

function handlePreflight(): Response {
  return new Response(null, {
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}

async function handleStartConversation(req: Request): Promise<Response> {
  const body = await parseJsonBody<DatabricksStartConversationRequest>(req);
  if (!body) return invalidJson();

  const missing = missingField([
    [body.content, "content"],
    [body.space_id, "space_id"],
  ]);
  if (missing) return missingFieldResponse(missing);

  try {
    const response = await startGenieConversation(body.space_id, body.content);
    return json(response, { status: 200 });
  } catch (error) {
    return serverError(error);
  }
}

async function handleGetMessage(req: Request): Promise<Response> {
  const body = await parseJsonBody<DatabricksGetMessageRequest>(req);
  if (!body) return invalidJson();

  const missing = missingField([
    [body.conversation_id, "conversation_id"],
    [body.message_id, "message_id"],
    [body.space_id, "space_id"],
  ]);
  if (missing) return missingFieldResponse(missing);

  try {
    const response = await getGenieMessage(
      body.space_id,
      body.conversation_id,
      body.message_id,
    );
    return json(response, { status: 200 });
  } catch (error) {
    return serverError(error);
  }
}

async function handleStreamConversation(req: Request): Promise<Response> {
  const body = await parseJsonBody<DatabricksStreamConversationRequest>(req);
  if (!body) return invalidJson();

  const missing = missingField([
    [body.content, "content"],
    [body.space_id, "space_id"],
  ]);
  if (missing) return missingFieldResponse(missing);

  return streamConversation(body);
}

async function parseJsonBody<T>(req: Request): Promise<T | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

function missingField(entries: Array<[unknown, string]>): string | null {
  for (const [value, name] of entries) {
    if (!value) return name;
  }
  return null;
}

function missingFieldResponse(field: string): Response {
  return json({ error: `${field} field is required` }, { status: 400 });
}

function invalidJson(): Response {
  return json({ error: "Invalid JSON body" }, { status: 400 });
}

function serverError(error: unknown): Response {
  console.error("Error calling Databricks Genie API:", error);
  return json(
    {
      error: error instanceof Error ? error.message : "Unknown error",
    },
    { status: 500 },
  );
}
