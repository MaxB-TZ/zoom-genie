interface DatabricksGetMessageResponse {
  message_id: string;
  conversation_id: string;
  space_id: string;
  content: string;
  status: string;
  created_timestamp: number;
  last_updated_timestamp: number;
  user_id: number;
  attachments?: Array<unknown>;
  error?: {
    error: string;
    type: string;
  };
  feedback?: {
    rating: string;
  };
  query_result?: {
    statement_id: string;
    statement_id_signature: string;
    row_count: number;
    is_truncated: boolean;
  };
  [key: string]: unknown;
}

export async function getGenieMessage(
  spaceId: string,
  conversationId: string,
  messageId: string,
): Promise<DatabricksGetMessageResponse> {
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
