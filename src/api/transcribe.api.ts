import { TranscribeApi } from "../../generated";
import { ThumbnailsConfig } from "../../generated/common";
import { CloudGlueError } from "../error";
import { SegmentationConfig, WaitForReadyOptions } from "../types";

/**
 * @deprecated
 */
export class EnhancedTranscribeApi {
  constructor(private readonly api: typeof TranscribeApi) {}

  /**
   * @deprecated use createDescribe instead
   */
  async createTranscribe(
    url: string,
    options: {
      enable_summary?: boolean;
      enable_speech?: boolean;
      enable_scene_text?: boolean;
      enable_visual_scene_description?: boolean;
      segmentation_config?: SegmentationConfig;
      segmentation_id?: string;
      thumbnail_config?: ThumbnailsConfig
    } = {}
  ) {
    return this.api.createTranscribe({
      url,
      ...options,
    });
  }

  /**
   * @deprecated use getDescribe instead
   */
  async getTranscribe(
    jobId: string,
    options: {
      response_format?: "json" | "markdown";
    } = {}
  ) {
    return this.api.getTranscribe({
      params: { job_id: jobId },
      queries: { response_format: options.response_format },
    });
  }

  /**
   * @deprecated use listDescribes instead
   */
  async listTranscribes(
    params: {
      limit?: number;
      offset?: number;
      status?:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "not_applicable";
      created_before?: string;
      created_after?: string;
      url?: string;
      response_format?: "json" | "markdown";
    } = {}
  ) {
    return this.api.listTranscribes({ queries: params });
  }

  /**
   * Waits for a transcription job to be ready by polling the getTranscribe endpoint until
   * the job reaches a terminal state (completed, failed, or not_applicable) or until maxAttempts is reached.
   *
   * @param jobId - The ID of the transcription job to wait for
   * @param options - Optional configuration for polling behavior and response format
   * @returns The final transcription job object
   * @throws {CloudGlueError} If the job fails to process or maxAttempts is reached
   * @deprecated
   */
  async waitForReady(
    jobId: string,
    options: WaitForReadyOptions & {
      response_format?: "json" | "markdown";
    } = {}
  ) {
    const {
      pollingInterval = 5000,
      maxAttempts = 36,
      response_format,
    } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const job = await this.getTranscribe(jobId, { response_format });

      // If we've reached a terminal state, return the job
      if (["completed", "failed", "not_applicable"].includes(job.status)) {
        if (job.status === "failed") {
          throw new CloudGlueError(`Transcription job failed: ${jobId}`);
        }
        return job;
      }

      // Wait for the polling interval before trying again
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudGlueError(
      `Timeout waiting for transcription job ${jobId} to process after ${maxAttempts} attempts`
    );
  }
}