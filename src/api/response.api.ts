import { ResponseApi } from '../../generated';
import { WaitForReadyOptions } from '../types';
import { CloudGlueError } from '../error';

type ResponseStatus = 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface CreateResponseParams {
  /** The model to use for the response */
  model: 'nimbus-001';
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
    collections: string[];
    filter?: {
      file_ids?: string[];
    };
  };
  /** Include additional data in response annotations */
  include?: Array<'cloudglue_citations.media_descriptions'>;
  /** Run the response generation in background (async) */
  background?: boolean;
}

export interface ListResponsesParams {
  limit?: number;
  offset?: number;
  status?: ResponseStatus;
  created_before?: string;
  created_after?: string;
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
