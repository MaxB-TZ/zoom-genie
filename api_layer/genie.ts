import { startGenieConversation } from "./start_conversation.ts";
import { getGenieMessage } from "./get_message.ts";

interface StartConversationRequest {
  content: string;
  space_id?: string;
}

interface GetMessageRequest {
  conversation_id: string;
  message_id: string;
  space_id?: string;
}

function json(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function handler(req: Request): Promise<Response> | Response {
  return (async () => {
    const url = new URL(req.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type",
        },
      });
    }

    // Route: POST /api/genie/start-conversation
    if (path === "/api/genie/start-conversation" && req.method === "POST") {
      let body: StartConversationRequest;
      try {
        body = await req.json();
      } catch {
        return json({ error: "Invalid JSON body" }, { status: 400 });
      }

      if (!body.content) {
        return json({ error: "content field is required" }, { status: 400 });
      }

      const spaceId = body.space_id || Deno.env.get("DATABRICKS_SPACE_ID");

      if (!spaceId) {
        return json(
          {
            error:
              "space_id is required. Provide it in the request body or set DATABRICKS_SPACE_ID environment variable",
          },
          { status: 400 },
        );
      }

      try {
        const databricksResponse = await startGenieConversation(
          spaceId,
          body.content,
        );

        return json(databricksResponse, { status: 200 });
      } catch (error) {
        console.error("Error calling Databricks Genie API:", error);
        return json(
          {
            error: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        );
      }
    }

    // Route: POST /api/genie/get-message
    if (path === "/api/genie/get-message" && req.method === "POST") {
      let body: GetMessageRequest;
      try {
        body = await req.json();
      } catch {
        return json({ error: "Invalid JSON body" }, { status: 400 });
      }

      if (!body.conversation_id) {
        return json(
          { error: "conversation_id field is required" },
          { status: 400 },
        );
      }

      if (!body.message_id) {
        return json({ error: "message_id field is required" }, { status: 400 });
      }

      const spaceId = body.space_id || Deno.env.get("DATABRICKS_SPACE_ID");

      if (!spaceId) {
        return json(
          {
            error:
              "space_id is required. Provide it in the request body or set DATABRICKS_SPACE_ID environment variable",
          },
          { status: 400 },
        );
      }

      try {
        const databricksResponse = await getGenieMessage(
          spaceId,
          body.conversation_id,
          body.message_id,
        );

        return json(databricksResponse, { status: 200 });
      } catch (error) {
        console.error("Error calling Databricks Genie API:", error);
        return json(
          {
            error: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        );
      }
    }

    // Route not found
    return json({ error: "Not found" }, { status: 404 });
  })();
}

