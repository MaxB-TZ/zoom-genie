# zoom-genie

A lightweight REST API server that provides a clean interface to interact with Databricks Genie API. Built with Deno.

## Setup

Create a `.env` file in the project root:

```env
DATABRICKS_WORKSPACE_URL=https://your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=your-databricks-token
```

## Start the Server

The dev task automatically loads your `.env` file:

```bash
deno task dev
```

Or run manually with the `--env-file` flag:

```bash
deno run --allow-net --allow-env --allow-read --env-file=.env main.ts
```

The server will start on `http://localhost:8000`

## API Endpoints

### Start a Conversation

**Endpoint:** `POST /api/genie/start-conversation`

**Request Body:**
```json
{
  "content": "Your question or message here",
  "space_id": "your-space-id"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/genie/start-conversation \
  -H "Content-Type: application/json" \
  -d '{"content": "What are the biggest open opportunities?", "space_id": "your-space-id"}'
```

### Get Message

**Endpoint:** `POST /api/genie/get-message`

**Request Body:**
```json
{
  "conversation_id": "conversation-uuid",
  "message_id": "message-uuid",
  "space_id": "your-space-id"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/genie/get-message \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "e1ef34712a29169db030324fd0e1df5f",
    "message_id": "e1ef34712a29169db030324fd0e1df5f",
    "space_id": "your-space-id"
  }'
```

### Stream Conversation

**Endpoint:** `POST /api/genie/stream-conversation`

Streams real-time updates from a Genie conversation using Server-Sent Events (SSE). This endpoint starts a conversation and automatically polls for status updates, streaming events as they occur.

**Request Body:**
```json
{
  "content": "Your question or message here",
  "space_id": "your-space-id",
  "poll_interval_ms": 2000,
  "max_polls": 300
}
```

**Parameters:**
- `content` (required): The question or message to send to Genie
- `space_id` (required): Your Databricks space ID
- `poll_interval_ms` (optional): Milliseconds between status polls. Defaults to `2000` (2 seconds)
- `max_polls` (optional): Maximum number of polls before timeout. Defaults to `300`

**Response Format:**
The endpoint returns a Server-Sent Events (SSE) stream with the following event types:

1. **`started`** - Emitted when the conversation is initiated:
```json
{
  "type": "started",
  "conversation_id": "conversation-uuid",
  "message_id": "message-uuid"
}
```

2. **`status`** - Emitted on each poll with current message status:
```json
{
  "type": "status",
  "status": "PROCESSING",
  "message": { /* full message object */ },
  "plain_text": ["text content"],
  "markdown_text": ["markdown content"]
}
```

3. **`error`** - Emitted if an error occurs:
```json
{
  "type": "error",
  "error": "Error message"
}
```

The stream automatically closes when the message status reaches a terminal state (`COMPLETED`, `FAILED`, or `CANCELLED`).

**Example:**
```bash
curl -X POST http://localhost:8000/api/genie/stream-conversation \
  -H "Content-Type: application/json" \
  -d '{
    "content": "What are the biggest open opportunities?",
    "space_id": "your-space-id",
    "poll_interval_ms": 2000,
    "max_polls": 300
  }'
```

**Note:** This endpoint uses Server-Sent Events. To consume the stream in JavaScript, use the `EventSource` API or handle the `text/event-stream` response directly.

## References

- [Databricks Start Genie Conversation API Docs](https://docs.databricks.com/api/workspace/genie/startconversation)
- [Databricks Get Conversation Message API Docs](https://docs.databricks.com/api/workspace/genie/getmessage)
