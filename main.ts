import { handler } from "./api_layer/start_conversation.ts";

export function startServer(port = 8000) {
  return Deno.serve({ port }, handler);
}

startServer();
