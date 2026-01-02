import { Face_MatchApi } from '../../generated';
import { FrameExtractionConfig } from '../types';
import { WaitForReadyOptions } from '../types';
import { CloudGlueError } from '../error';

export class EnhancedFaceMatchApi {
  constructor(private readonly api: typeof Face_MatchApi) {}

  async createFaceMatch(params: {
    source_image: { url?: string; base64_image?: string; file_path?: string };
    target_video_url: string;
    max_faces?: number;
    face_detection_id?: string;
    frame_extraction_id?: string;
    frame_extraction_config?: FrameExtractionConfig;
  }) {
    return this.api.createFaceMatch(params);
  }

  async getFaceMatch(
    faceMatchId: string,
    params: {
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const { limit, offset } = params;
    return this.api.getFaceMatch({
      params: { face_match_id: faceMatchId },
      queries: { limit, offset },
    });
  }

  async deleteFaceMatch(faceMatchId: string) {
    return this.api.deleteFaceMatch(undefined, {
      params: { face_match_id: faceMatchId },
    });
  }

  async listFaceMatches(
    params: {
      offset?: number;
      limit?: number;
      created_before?: string;
      created_after?: string;
      status?: 'pending' | 'processing' | 'completed' | 'failed';
    } = {},
  ) {
    return this.api.listFaceMatch({ queries: params });
  }

  async waitForReady(faceMatchId: string, options: WaitForReadyOptions = {}) {
    const { pollingInterval = 5000, maxAttempts = 36 } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const job = await this.getFaceMatch(faceMatchId);

      if (['completed', 'failed'].includes(job.status)) {
        if (job.status === 'failed') {
          throw new CloudGlueError(`Face match job failed: ${faceMatchId}`);
        }
        return job;
      }

      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudGlueError(
      `Face match job did not complete within ${(maxAttempts * pollingInterval) / 1000} seconds: ${faceMatchId}`,
    );
  }
}
