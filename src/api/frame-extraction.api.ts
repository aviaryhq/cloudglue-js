import { FramesApi } from "../../generated";
import { WaitForReadyOptions } from "../types";
import { CloudGlueError } from "../error";

export class EnhancedFramesApi {
  constructor(private readonly api: typeof FramesApi) {}

  async getFrameExtraction(frameExtractionId: string, params: {
    limit?: number;
    offset?: number;
  } = {}) {
    return this.api.getFrameExtraction({ 
      params: { frame_extraction_id: frameExtractionId },
      queries: params 
    });
  }

  async deleteFrameExtraction(frameExtractionId: string) {
    return this.api.deleteFrameExtraction(
      undefined,
      { params: { frame_extraction_id: frameExtractionId } }
    );
  }

  async waitForReady(frameExtractionId: string, options: WaitForReadyOptions = {}) {
    const { pollingInterval = 5000, maxAttempts = 36 } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const job = await this.getFrameExtraction(frameExtractionId);

      if (["completed", "failed"].includes(job.status)) {
        if (job.status === "failed") {
          throw new CloudGlueError(`Frame extraction job failed: ${frameExtractionId}`);
        }
        return job;
      }

      await new Promise(resolve => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudGlueError(`Frame extraction job did not complete within ${maxAttempts * pollingInterval / 1000} seconds: ${frameExtractionId}`);
  }
}