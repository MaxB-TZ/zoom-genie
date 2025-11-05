interface GenieRequest {
  content: string;
  space_id?: string;
}

interface DatabricksStartConversationRequest {
  content: string;
}

interface DatabricksStartConversationResponse {
  conversation_id: string;
  [key: string]: unknown;
}

function json(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { ...init, headers });
}

async function startGenieConversation(
  spaceId: string,
  content: string,
): Promise<DatabricksStartConversationResponse> {
  const databricksUrl = Deno.env.get("DATABRICKS_WORKSPACE_URL");
  const databricksToken = Deno.env.get("DATABRICKS_TOKEN");

  if (!databricksUrl) {
    throw new Error("DATABRICKS_WORKSPACE_URL environment variable is required");
  }

  if (!databricksToken) {
    throw new Error("DATABRICKS_TOKEN environment variable is required");
  }

  // Remove trailing slash if present
  const baseUrl = databricksUrl.replace(/\/$/, "");
  const apiUrl = `${baseUrl}/api/2.0/genie/spaces/${spaceId}/start-conversation`;

  const requestBody: DatabricksStartConversationRequest = {
    content,
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${databricksToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Databricks API error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return await response.json() as DatabricksStartConversationResponse;
}

export function handler(req: Request): Promise<Response> | Response {
  return (async () => {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type",
        },
      });
    }

    if (req.method === "POST") {
      let body: GenieRequest;
      try {
        body = await req.json();
      } catch {
        return json({ error: "Invalid JSON body" }, { status: 400 });
      }

      if (!body.content) {
        return json({ error: "content field is required" }, { status: 400 });
      }

      // Get space_id from request body or environment variable
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

    return json({ error: "Method not allowed" }, { status: 405 });
  })();
}
