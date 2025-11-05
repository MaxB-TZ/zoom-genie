import { assertEquals } from "@std/assert";
import { handler } from "./api_layer/genie.ts";

Deno.test("CORS preflight request", async () => {
  const request = new Request("http://localhost:8000/api/genie/start-conversation", {
    method: "OPTIONS",
  });

  const response = await handler(request);
  assertEquals(response.status, 200);
  assertEquals(response.headers.get("access-control-allow-origin"), "*");
  assertEquals(response.headers.get("access-control-allow-methods"), "GET,POST,OPTIONS");
});

Deno.test("Start conversation - missing content", async () => {
  const request = new Request("http://localhost:8000/api/genie/start-conversation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  const response = await handler(request);
  assertEquals(response.status, 400);
  const body = await response.json();
  assertEquals(body.error, "content field is required");
});

Deno.test("Start conversation - missing space_id", async () => {
  const request = new Request("http://localhost:8000/api/genie/start-conversation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: "test question" }),
  });

  const response = await handler(request);
  assertEquals(response.status, 400);
  const body = await response.json();
  assertEquals(body.error, "space_id field is required");
});

Deno.test("Start conversation - invalid JSON", async () => {
  const request = new Request("http://localhost:8000/api/genie/start-conversation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "invalid json{",
  });

  const response = await handler(request);
  assertEquals(response.status, 400);
  const body = await response.json();
  assertEquals(body.error, "Invalid JSON body");
});

Deno.test("Get message - missing conversation_id", async () => {
  const request = new Request("http://localhost:8000/api/genie/get-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message_id: "test-message-id",
    }),
  });

  const response = await handler(request);
  assertEquals(response.status, 400);
  const body = await response.json();
  assertEquals(body.error, "conversation_id field is required");
});

Deno.test("Get message - missing message_id", async () => {
  const request = new Request("http://localhost:8000/api/genie/get-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_id: "test-conversation-id",
    }),
  });

  const response = await handler(request);
  assertEquals(response.status, 400);
  const body = await response.json();
  assertEquals(body.error, "message_id field is required");
});

Deno.test("Get message - missing space_id", async () => {
  const request = new Request("http://localhost:8000/api/genie/get-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_id: "test-conversation-id",
      message_id: "test-message-id",
    }),
  });

  const response = await handler(request);
  assertEquals(response.status, 400);
  const body = await response.json();
  assertEquals(body.error, "space_id field is required");
});

Deno.test("Unknown route returns 404", async () => {
  const request = new Request("http://localhost:8000/api/genie/unknown", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  const response = await handler(request);
  assertEquals(response.status, 404);
  const body = await response.json();
  assertEquals(body.error, "Not found");
});

Deno.test("Wrong HTTP method returns 404", async () => {
  const request = new Request("http://localhost:8000/api/genie/start-conversation", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const response = await handler(request);
  assertEquals(response.status, 404);
  const body = await response.json();
  assertEquals(body.error, "Not found");
});
