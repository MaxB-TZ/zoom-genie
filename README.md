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

## References

- [Databricks Start Genie Conversation API Docs](https://docs.databricks.com/api/workspace/genie/startconversation)
- [Databricks Get Conversation Message API Docs](https://docs.databricks.com/api/workspace/genie/getmessage)
