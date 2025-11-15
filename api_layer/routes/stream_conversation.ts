import { startGenieConversation } from "./start_conversation.ts";
import { getGenieMessage } from "./get_message.ts";
import {
  Attachment,
  AttachmentText,
  DatabricksStreamConversationRequest,
} from "../types.ts";

const TERMINAL_STATES = ["COMPLETED", "FAILED", "CANCELLED"];

function extractAttachmentText(attachments?: unknown): AttachmentText {
  if (!Array.isArray(attachments)) {
    return { plain: [], markdown: [] };
  }

  const result: AttachmentText = { plain: [], markdown: [] };

  for (const attachment of attachments as Attachment[]) {
    const contentItems = Array.isArray(attachment?.content)
      ? attachment.content
      : [];
    for (const item of contentItems) {
      if (!item || typeof item.data !== "string") continue;
      if (item.content_type === "text/plain") {
        result.plain.push(item.data);
      } else if (item.content_type === "text/markdown") {
        result.markdown.push(item.data);
      }
    }
  }

  return result;
}

function keepAlive(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
) {
  try {
    controller.enqueue(encoder.encode(`: keep-alive\n\n`));
  } catch {
    // Ignore enqueue failures; stream is likely closed.
  }
}

export function streamConversation(
  body: DatabricksStreamConversationRequest,
): Response {
  const pollInterval = body.poll_interval_ms ?? 2000;
  const maxPolls = body.max_polls ?? 300;
  const encoder = new TextEncoder();
  let streamClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        if (streamClosed) return false;

        try {
          const payload = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
          return true;
        } catch (error) {
          streamClosed = true;
          console.error("[Stream] Failed to enqueue event:", error);
          return false;
        }
      };

      const close = () => {
        if (!streamClosed) {
          streamClosed = true;
          try {
            controller.close();
          } catch {
            // Already closed.
          }
        }
      };

      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      try {
        const { conversation_id, message_id } = await startGenieConversation(
          body.space_id,
          body.content,
        );

        if (!send({ type: "started", conversation_id, message_id })) {
          return;
        }

        for (let poll = 0; poll < maxPolls && !streamClosed; poll++) {
          keepAlive(controller, encoder);

          const message = await getGenieMessage(
            body.space_id,
            conversation_id,
            message_id,
          );

          if (streamClosed) return;

          const { plain, markdown } = extractAttachmentText(
            (message as { attachments?: unknown }).attachments,
          );

          const payload: Record<string, unknown> = {
            type: "status",
            status: message.status,
            message,
          };

          if (plain.length) payload.plain_text = plain;
          if (markdown.length) payload.markdown_text = markdown;

          if (!send(payload)) return;

          if (TERMINAL_STATES.includes(message.status)) {
            close();
            return;
          }

          if (poll < maxPolls - 1 && !streamClosed) {
            await delay(pollInterval);
          }
        }

        close();
      } catch (error) {
        send({
          type: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
        close();
      }
    },
    cancel(reason) {
      streamClosed = true;
      console.log("[Stream] Client cancelled:", reason);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
    },
  });
}
