export interface DatabricksStreamConversationRequest {
  content: string;
  space_id: string;
  poll_interval_ms?: number;
  max_polls?: number;
}

export type AttachmentContent = {
  content_type?: string;
  data?: string;
};

export type Attachment = {
  attachment_type?: string;
  content?: AttachmentContent[];
  [key: string]: unknown;
};

export type AttachmentText = {
  plain: string[];
  markdown: string[];
};

export interface DatabricksStartConversationRequest {
  content: string;
  space_id: string;
}

export interface DatabricksStartConversationResponse {
  conversation_id: string;
  message_id: string;
  [key: string]: unknown;
}

export interface DatabricksGetMessageRequest {
  conversation_id: string;
  message_id: string;
  space_id: string;
}

export interface DatabricksGetMessageResponse {
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
