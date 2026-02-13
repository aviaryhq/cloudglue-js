import { ResponseApi } from '../../generated';
import type { SearchFilter } from '../../generated/common';
import { WaitForReadyOptions } from '../types';
import { CloudGlueError } from '../error';

type ResponseStatus = 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface CreateResponseParams {
  /** The model to use for the response */
  model: 'nimbus-001' | 'nimbus-002-preview' | (string & {});
  /** The input message(s) - can be a simple string or array of structured messages */
  input:
    | string
    | Array<{
        type: 'message';
        role: 'developer' | 'user' | 'assistant';
        content: Array<{ type: 'input_text'; text: string }>;
      }>;
  /** Optional system instructions */
  instructions?: string;
  /** Temperature for response generation (0-2, default 0.7) */
  temperature?: number;
  /** Knowledge base configuration specifying collections to search */
  knowledge_base: {
    type?: 'general_question_answering' | 'entity_backed_knowledge';
    collections: string[];
    filter?: SearchFilter;
    entity_backed_knowledge_config?: {
      entity_collections: Array<{
        name: string;
        description: string;
        collection_id: string;
      }>;
      description?: string;
    };
  };
  /** Include additional data in response annotations */
  include?: Array<'cloudglue_citations.media_descriptions'>;
  /** Run the response generation in background (async) */
  background?: boolean;
  /** Enable server-sent events streaming */
  stream?: boolean;
}

export interface ListResponsesParams {
  limit?: number;
  offset?: number;
  status?: ResponseStatus;
  created_before?: string;
  created_after?: string;
}

// --- Streaming event types ---

export interface ResponseCreatedEvent {
  type: 'response.created';
  response: Record<string, any>;
}

export interface ResponseOutputItemAddedEvent {
  type: 'response.output_item.added';
  output_index: number;
  item: Record<string, any>;
}

export interface ResponseContentPartAddedEvent {
  type: 'response.content_part.added';
  output_index: number;
  content_index: number;
  part: Record<string, any>;
}

export interface ResponseOutputTextDeltaEvent {
  type: 'response.output_text.delta';
  output_index: number;
  content_index: number;
  delta: string;
}

export interface ResponseOutputTextDoneEvent {
  type: 'response.output_text.done';
  output_index: number;
  content_index: number;
  text: string;
}

export interface ResponseContentPartDoneEvent {
  type: 'response.content_part.done';
  output_index: number;
  content_index: number;
  part: Record<string, any>;
}

export interface ResponseOutputItemDoneEvent {
  type: 'response.output_item.done';
  output_index: number;
  item: Record<string, any>;
}

export interface ResponseCompletedEvent {
  type: 'response.completed';
  response: Record<string, any>;
}

export interface ResponseErrorEvent {
  type: 'error';
  error: {
    message: string;
    type?: string;
    code?: string;
  };
}

export type ResponseStreamEventType =
  | ResponseCreatedEvent
  | ResponseOutputItemAddedEvent
  | ResponseContentPartAddedEvent
  | ResponseOutputTextDeltaEvent
  | ResponseOutputTextDoneEvent
  | ResponseContentPartDoneEvent
  | ResponseOutputItemDoneEvent
  | ResponseCompletedEvent
  | ResponseErrorEvent;

/**
 * Process buffered lines, yielding parsed SSE events.
 * Returns true if a [DONE] sentinel was encountered.
 */
function* processLines(
  buffer: { value: string },
): Generator<ResponseStreamEventType | 'DONE'> {
  let newlineIdx: number;
  while ((newlineIdx = buffer.value.indexOf('\n')) !== -1) {
    const line = buffer.value.slice(0, newlineIdx).trimEnd();
    buffer.value = buffer.value.slice(newlineIdx + 1);

    // Skip empty lines and event: lines (type is in the JSON data)
    if (!line || line.startsWith('event:')) {
      continue;
    }

    if (line.startsWith('data: ')) {
      const jsonStr = line.slice(6);
      if (jsonStr === '[DONE]') {
        yield 'DONE';
        return;
      }
      try {
        yield JSON.parse(jsonStr) as ResponseStreamEventType;
      } catch {
        // Skip malformed JSON lines
      }
    }
  }
}

/**
 * Parse an SSE stream into an async iterable of typed events.
 * Uses the web-standard ReadableStream and TextDecoder APIs for cross-environment compatibility
 * (works in both Node.js 18+ and modern browsers).
 */
async function* parseSSEStream(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<ResponseStreamEventType> {
  const decoder = new TextDecoder('utf-8');
  const buffer = { value: '' };
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer.value += decoder.decode(value, { stream: true });

      for (const event of processLines(buffer)) {
        if (event === 'DONE') return;
        yield event;
      }
    }

    // Flush any remaining bytes from the decoder and process trailing lines
    buffer.value += decoder.decode();
    if (buffer.value) {
      for (const event of processLines(buffer)) {
        if (event === 'DONE') return;
        yield event;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export class EnhancedResponseApi {
  constructor(private readonly api: typeof ResponseApi) {}

  /**
   * Create a new response using the Response API.
   * This provides an OpenAI Responses-compatible interface for chat completions with video collections.
   *
   * @param params - Response creation parameters
   * @returns The created response
   */
  async createResponse(params: CreateResponseParams) {
    return this.api.createResponse(params);
  }

  /**
   * Create a streaming response using the Response API with server-sent events.
   * Returns an async iterable that yields events as they arrive from the server.
   *
   * @param params - Response creation parameters (stream and background are set automatically)
   * @returns Async iterable of streaming events
   */
  async createStreamingResponse(
    params: Omit<CreateResponseParams, 'stream' | 'background'>,
  ): Promise<AsyncIterable<ResponseStreamEventType>> {
    const body = {
      ...params,
      stream: true,
      background: false,
    };

    const baseURL = this.api.axios.defaults.baseURL;
    const url = `${baseURL}/responses`;

    // Headers are set at the top level of defaults.headers by Object.assign in client.ts
    const h = this.api.axios.defaults.headers as Record<string, any>;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        Authorization: h['Authorization'] as string,
        'x-sdk-client': h['x-sdk-client'] as string,
        'x-sdk-version': h['x-sdk-version'] as string,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      let responseData: any;
      try {
        responseData = await response.json();
        if (responseData?.error) {
          errorMessage = responseData.error;
        }
      } catch {
        // Could not parse error body
      }
      throw new CloudGlueError(
        errorMessage,
        response.status,
        JSON.stringify(body),
        Object.fromEntries(response.headers.entries()),
        responseData,
      );
    }

    if (!response.body) {
      throw new CloudGlueError('Response body is empty — streaming not supported in this environment');
    }

    return parseSSEStream(response.body);
  }

  /**
   * List all responses with pagination and filtering options.
   *
   * @param params - Optional pagination and filtering parameters
   * @returns Paginated list of responses
   */
  async listResponses(params: ListResponsesParams = {}) {
    return this.api.listResponses({ queries: params });
  }

  /**
   * Retrieve a specific response by its ID.
   *
   * @param responseId - The ID of the response to retrieve
   * @returns The response object
   */
  async getResponse(responseId: string) {
    return this.api.getResponse({ params: { id: responseId } });
  }

  /**
   * Delete a response by ID.
   * This operation is idempotent - deleting a non-existent response returns success.
   *
   * @param responseId - The ID of the response to delete
   * @returns Deletion confirmation
   */
  async deleteResponse(responseId: string) {
    return this.api.deleteResponse(undefined, { params: { id: responseId } });
  }

  /**
   * Cancel a background response that is in progress.
   * If the response is already completed, failed, or cancelled, this returns the response as-is.
   *
   * @param responseId - The ID of the response to cancel
   * @returns The response object
   */
  async cancelResponse(responseId: string) {
    return this.api.cancelResponse(undefined, { params: { id: responseId } });
  }

  /**
   * Waits for a background response to complete by polling until it reaches
   * a terminal state (completed, failed, or cancelled) or until maxAttempts is reached.
   *
   * @param responseId - The ID of the response to wait for
   * @param options - Optional configuration for polling behavior
   * @returns The final response object
   * @throws {CloudGlueError} If the response fails or maxAttempts is reached
   */
  async waitForReady(responseId: string, options: WaitForReadyOptions = {}) {
    const { pollingInterval = 5000, maxAttempts = 36 } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await this.getResponse(responseId);

      // If we've reached a terminal state, return the response
      if (['completed', 'failed', 'cancelled'].includes(response.status!)) {
        if (response.status === 'failed') {
          throw new CloudGlueError(
            `Response generation failed: ${response.error?.message || responseId}`,
          );
        }
        return response;
      }

      // Wait for the polling interval before trying again
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudGlueError(
      `Timeout waiting for response ${responseId} to complete after ${maxAttempts} attempts`,
    );
  }
}
