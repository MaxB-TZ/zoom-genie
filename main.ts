import { handler } from "./api_layer/genie.ts";

export function startServer(port = 8000) {
  return Deno.serve({ port }, handler);
}

startServer();
