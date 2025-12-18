import { define } from "../../utils.ts";
import { streamConversation } from "../../api_layer/routes/stream_conversation.ts";
import type { DatabricksStreamConversationRequest } from "../../api_layer/types.ts";

export const handler = define.handlers({
  POST: async (ctx) => {
    const body = await ctx.req.json() as DatabricksStreamConversationRequest;
    return streamConversation(body);
  },
});
