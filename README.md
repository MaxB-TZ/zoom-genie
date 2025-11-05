# zoom-genie
A chat interface built on top of the Databricks Genie API

## Setup

Set the following environment variables:

- `DATABRICKS_WORKSPACE_URL`: Your Databricks workspace URL (e.g., `https://your-workspace.cloud.databricks.com`)
- `DATABRICKS_TOKEN`: Your Databricks personal access token or API token
- `DATABRICKS_SPACE_ID`: (Optional) Your Genie space ID. Can also be provided in each request body.

## API Usage

### Start a Conversation

**Endpoint:** `POST /api/genie`

**Request Body:**
```json
{
  "content": "Your question or message here",
  "space_id": "optional-space-id-if-not-set-in-env"
}
```

**Response:**
```json
{
  "conversation_id": "conversation-uuid",
  ...
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/genie \
  -H "Content-Type: application/json" \
  -d '{"content": "What are the biggest open opportunities?"}'
```

## References

- [Databricks Genie API Documentation](https://docs.databricks.com/api/workspace/genie/startconversation)
