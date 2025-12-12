import { ExtractApi } from "../../generated";
import { ThumbnailsConfig } from "../../generated/common";
import { CloudGlueError } from "../error";
import { SegmentationConfig, WaitForReadyOptions } from "../types";
export class EnhancedExtractApi {

  constructor(private readonly api: typeof ExtractApi) {}

  async createExtract(
    url: string,
    options?: {
      prompt?: string;
      schema?: Record<string, any>;
      enable_video_level_entities?: boolean;
      enable_segment_level_entities?: boolean;
      segmentation_config?: SegmentationConfig;
      segmentation_id?: string;
      thumbnail_config?: ThumbnailsConfig
    }
  ) {
    return this.api.createExtract({
      url,
      ...options,
    });
  }

  async getExtract(jobId: string, params: {limit?: number, offset?: number} = {}) {
    return this.api.getExtract({ 
      params: { job_id: jobId },
      queries: params
    });
  }

  async listExtracts(
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
      include_data?: boolean;
    } = {}
  ) {
    return this.api.listExtracts({ queries: params });
  }
  async deleteExtract(jobId: string) {
    return this.api.deleteExtract(undefined, { params: { job_id: jobId } });
  }

  /**
   * Waits for an extraction job to be ready by polling the getExtract endpoint until
   * the job reaches a terminal state (completed, failed, or not_applicable) or until maxAttempts is reached.
   *
   * @param jobId - The ID of the extraction job to wait for
   * @param options - Optional configuration for polling behavior
   * @returns The final extraction job object
   * @throws {CloudGlueError} If the job fails to process or maxAttempts is reached
   */
  async waitForReady(jobId: string, options: WaitForReadyOptions = {}) {
    const { pollingInterval = 5000, maxAttempts = 36 } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const job = await this.getExtract(jobId);

      // If we've reached a terminal state, return the job
      if (["completed", "failed", "not_applicable"].includes(job.status)) {
        if (job.status === "failed") {
          throw new CloudGlueError(`Extraction job failed: ${jobId}`);
        }
        return job;
      }

      // Wait for the polling interval before trying again
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudGlueError(
      `Timeout waiting for extraction job ${jobId} to process after ${maxAttempts} attempts`
    );
  }
}