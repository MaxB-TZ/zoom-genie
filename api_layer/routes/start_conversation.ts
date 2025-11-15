import {
  DatabricksStartConversationRequest,
  DatabricksStartConversationResponse,
} from "../types.ts";

export async function startGenieConversation(
  spaceId: string,
  content: string,
): Promise<DatabricksStartConversationResponse> {
  const databricksUrl = Deno.env.get("DATABRICKS_WORKSPACE_URL");
  const databricksToken = Deno.env.get("DATABRICKS_TOKEN");

  if (!databricksUrl) {
    throw new Error(
      "DATABRICKS_WORKSPACE_URL environment variable is required",
    );
  }

  if (!databricksToken) {
    throw new Error("DATABRICKS_TOKEN environment variable is required");
  }

  // Remove trailing slash if present
  const baseUrl = databricksUrl.replace(/\/$/, "");
  const apiUrl =
    `${baseUrl}/api/2.0/genie/spaces/${spaceId}/start-conversation`;

  const requestBody: DatabricksStartConversationRequest = {
    content,
    space_id: spaceId,
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
