import { Face_DetectionApi } from "../../generated";
import { FrameExtractionConfig } from "../types";
import { WaitForReadyOptions } from "../types";
import { CloudGlueError } from "../error";

export class EnhancedFaceDetectionApi {
  constructor(private readonly api: typeof Face_DetectionApi) {}

  async createFaceDetection(params: {
    url: string;
    frame_extraction_id?: string;
    frame_extraction_config?: FrameExtractionConfig;
  }) {
    return this.api.createFaceDetection(params);
  }

  async getFaceDetection(faceDetectionId: string, params: {
    limit?: number;
    offset?: number;
  } = {}) {
    const { limit, offset } = params;
    return this.api.getFaceDetection({ 
      params: { face_detection_id: faceDetectionId },
      queries: { limit, offset }
    });
  }

  async deleteFaceDetection(faceDetectionId: string) {
    return this.api.deleteFaceDetection(
      undefined,
      { params: { face_detection_id: faceDetectionId } }
    );
  }

  async waitForReady(faceDetectionId: string, options: WaitForReadyOptions = {}) {
    const { pollingInterval = 5000, maxAttempts = 36 } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const job = await this.getFaceDetection(faceDetectionId);

      if (["completed", "failed"].includes(job.status)) {
        if (job.status === "failed") {
          throw new CloudGlueError(`Face detection job failed: ${faceDetectionId}`);
        }
        return job;
      }

      await new Promise(resolve => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudGlueError(`Face detection job did not complete within ${maxAttempts * pollingInterval / 1000} seconds: ${faceDetectionId}`);
  }
}