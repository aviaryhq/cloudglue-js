import { DescribeApi } from '../../generated';
import { SegmentationConfig } from '../types';
import { ThumbnailsConfig } from '../../generated/common';
import { WaitForReadyOptions } from '../types';
import { CloudGlueError } from '../error';

export class EnhancedDescribeApi {
  constructor(private readonly api: typeof DescribeApi) {}

  async createDescribe(
    url: string,
    options: {
      enable_summary?: boolean;
      enable_speech?: boolean;
      enable_scene_text?: boolean;
      enable_visual_scene_description?: boolean;
      enable_audio_description?: boolean;
      segmentation_config?: SegmentationConfig;
      segmentation_id?: string;
      thumbnail_config?: ThumbnailsConfig;
    } = {},
  ) {
    return this.api.createDescribe({
      url,
      ...options,
    });
  }

  async getDescribe(
    jobId: string,
    options: {
      response_format?: 'json' | 'markdown';
      start_time_seconds?: number;
      end_time_seconds?: number;
    } = {
      response_format: 'json',
    },
  ) {
    return this.api.getDescribe({
      params: { job_id: jobId },
      queries: { ...options },
    });
  }

  async listDescribes(
    params: {
      limit?: number;
      offset?: number;
      status?:
        | 'pending'
        | 'processing'
        | 'completed'
        | 'failed'
        | 'not_applicable';
      created_before?: string;
      created_after?: string;
      url?: string;
      response_format?: 'json' | 'markdown';
      include_data?: boolean;
    } = {},
  ) {
    return this.api.listDescribes({ queries: params });
  }

  async deleteDescribe(jobId: string) {
    return this.api.deleteDescribe(undefined, { params: { job_id: jobId } });
  }
  /**
   * Waits for a description job to be ready by polling the getDescribe endpoint until
   * the job reaches a terminal state (completed, failed, or not_applicable) or until maxAttempts is reached.
   *
   * @param jobId - The ID of the description job to wait for
   * @param options - Optional configuration for polling behavior and response format
   * @returns The final description job object
   * @throws {CloudGlueError} If the job fails to process or maxAttempts is reached
   */
  async waitForReady(
    jobId: string,
    options: WaitForReadyOptions & {
      response_format?: 'json' | 'markdown';
    } = {},
  ) {
    const {
      pollingInterval = 5000,
      maxAttempts = 36,
      response_format,
    } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const job = await this.getDescribe(jobId, { response_format });

      // If we've reached a terminal state, return the job
      if (['completed', 'failed', 'not_applicable'].includes(job.status)) {
        if (job.status === 'failed') {
          throw new CloudGlueError(`Description job failed: ${jobId}`);
        }
        return job;
      }

      // Wait for the polling interval before trying again
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudGlueError(
      `Timeout waiting for description job ${jobId} to process after ${maxAttempts} attempts`,
    );
  }
}
