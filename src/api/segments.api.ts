import { SegmentsApi } from "../../generated";
import { ShotConfig, NarrativeConfig } from "../types";
import { WaitForReadyOptions } from "../types";
import { CloudGlueError } from "../error";

export class EnhancedSegmentsApi {
  constructor(private readonly api: typeof SegmentsApi) {}
  async listSegmentJobs(data: {
    criteria?: "shot" | "narrative";
    url?: string;
    status?: "pending" | "processing" | "completed" | "failed";
    limit?: number;
    offset?: number;
    created_before?: string;
    created_after?: string;
    order?: "created_at";
    sort?: "asc" | "desc";
    
  }) {
    return this.api.listSegments({ queries: data });
  }

  async getSegmentJob(jobId: string) {
    return this.api.getSegments({ params: { job_id: jobId } });
  }

  async createSegmentJob(params: {  
    url: string;
    criteria: "shot" | "narrative";
    shot_config?: ShotConfig;
    narrative_config?: NarrativeConfig;
  }) {
    return this.api.createSegments(params);
  }

  async deleteSegmentJob(jobId: string) {
    return this.api.deleteSegments(
      undefined,
      { params: { job_id: jobId } }
    );
  }

  async waitForReady(jobId: string, options: WaitForReadyOptions = {}) {
    const {
      pollingInterval = 5000,
      maxAttempts = 36,
    } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const job = await this.getSegmentJob(jobId);

      // If we've reached a terminal state, return the job
      if (["completed", "failed", "not_applicable"].includes(job.status)) {
        if (job.status === "failed") {
          throw new CloudGlueError(`Segment job failed: ${jobId}`);
        }
        return job;
      }

      // Wait for the polling interval before trying again
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudGlueError(
      `Timeout waiting for segment job ${jobId} to process after ${maxAttempts} attempts`
    );
  }
}
