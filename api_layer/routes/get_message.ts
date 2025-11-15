import { DatabricksGetMessageResponse } from "../types.ts";

export async function getGenieMessage(
  spaceId: string,
  conversationId: string,
  messageId: string,
): Promise<DatabricksGetMessageResponse> {
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
    `${baseUrl}/api/2.0/genie/spaces/${spaceId}/conversations/${conversationId}/messages/${messageId}`;

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${databricksToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Databricks API error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return await response.json() as DatabricksGetMessageResponse;
}
