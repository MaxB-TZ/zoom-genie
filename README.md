# Zoom Genie

A Fresh web application for interacting with Databricks Genie API. Built with Deno, Fresh, Preact, and DaisyUI.

## Project Setup

Install Deno:
```bash
brew install deno
```

Create a `.env` file in the project root:

```env
DATABRICKS_WORKSPACE_URL=https://your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=your-databricks-token
```

## Development

Start the development server:

```bash
deno task dev
```

The app will be available at `http://localhost:8000`

## Building for Production

Build the application:

```bash
deno task build
```

Start the production server:

```bash
deno task start
```

## Usage

1. Enter your Databricks Space ID
2. Enter your question or message
3. Click "Send" to stream the response in real-time

The application uses Server-Sent Events (SSE) to stream responses from the Databricks Genie API, providing real-time updates as the conversation progresses.

## API Layer

The `api_layer/` directory contains the core API logic for interacting with Databricks Genie:
- `routes/start_conversation.ts` - Starts a new Genie conversation
- `routes/get_message.ts` - Retrieves a message from a conversation
- `routes/stream_conversation.ts` - Streams conversation updates via SSE
- `types.ts` - TypeScript type definitions

## References

- [Databricks Start Genie Conversation API Docs](https://docs.databricks.com/api/workspace/genie/startconversation)
- [Databricks Get Conversation Message API Docs](https://docs.databricks.com/api/workspace/genie/getmessage)
- [Fresh Framework](https://fresh.deno.dev/)
- [DaisyUI Components](https://daisyui.com/)
