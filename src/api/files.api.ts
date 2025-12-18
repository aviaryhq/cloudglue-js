import { FilesApi } from '../../generated';
import {
  FrameExtractionConfig,
  ListFilesParams,
  SegmentationConfig,
  ThumbnailType,
  UpdateFileParams,
  WaitForReadyOptions,
} from '../types';
import { CloudGlueError } from '../error';

type UploadFileParams = {
  file: globalThis.File;
  metadata?: Record<string, any>;
  /**
   * If enabled, the file will be segmented and thumbnails will be generated for each segment for the default segmentation config.
   */
  enable_segment_thumbnails?: boolean;
};

export class EnhancedFilesApi {
  constructor(private readonly api: typeof FilesApi) {}

  async listFiles(params: ListFilesParams = {}) {
    const { filter, ...otherParams } = params;

    // Convert filter object to JSON string if provided
    const queries: any = { ...otherParams };
    if (filter) {
      try {
        queries.filter = JSON.stringify(filter);
      } catch (error) {
        throw new CloudGlueError(
          `Failed to serialize filter object: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return this.api.listFiles({ queries });
  }

  async uploadFile(params: UploadFileParams) {
    // File uploads require special handling for multipart/form-data that the generated Zodios client doesn't handle automatically.
    // We need to:
    // 1. Create a FormData object and append the file with the correct field name
    // 2. JSON stringify the metadata if present
    // 3. Set the correct Content-Type header
    // This is why we use axios directly instead of the generated client method.

    const formData = new FormData();
    formData.append('file', params.file);

    // Add metadata if provided
    if (params.metadata) {
      try {
        formData.append('metadata', JSON.stringify(params.metadata));
      } catch (error) {
        throw new CloudGlueError(
          `Failed to serialize metadata object: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
    if (params.enable_segment_thumbnails !== undefined) {
      formData.append(
        'enable_segment_thumbnails',
        params.enable_segment_thumbnails.toString(),
      );
    }

    // Use axios directly to bypass Zodios validation
    return this.api.axios({
      method: 'post',
      url: '/files',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getFile(fileId: string) {
    return this.api.getFile({ params: { file_id: fileId } });
  }

  async deleteFile(fileId: string) {
    return this.api.deleteFile(undefined, {
      params: { file_id: fileId },
    });
  }

  async updateFile(fileId: string, params: UpdateFileParams) {
    return this.api.updateFile(
      { ...params, filename: params.filename ?? undefined },
      { params: { file_id: fileId } },
    );
  }

  async listFileSegmentations(
    fileId: string,
    params: { limit?: number; offset?: number } = {},
  ) {
    return this.api.listFileSegmentations({
      params: { file_id: fileId },
      queries: params,
    });
  }

  /**
   * Get thumbnails for a file. If a segmentationId is provided, the thumbnails will be for a specific segmentation.
   * @param fileId - The ID of the file
   * @param params - Optional parameters
   * @returns The thumbnails for the file
   */
  async getFileThumbnails(
    fileId: string,
    params: {
      limit?: number;
      offset?: number;
      isDefault?: boolean;
      segmentationId?: string;
      type?: ThumbnailType[];
    },
  ) {
    return this.api.getThumbnails({
      params: { file_id: fileId },
      queries: {
        ...params,
        is_default: params.isDefault ?? false,
        type: params.type?.join(','),
      },
    });
  }

  async createFileSegmentation(fileId: string, params: SegmentationConfig) {
    return this.api.createFileSegmentation(params, {
      params: { file_id: fileId },
      body: params,
    } as any);
  }

  async createFileFrameExtraction(
    fileId: string,
    params: FrameExtractionConfig,
  ) {
    return this.api.createFileFrameExtraction(params, {
      params: { file_id: fileId },
    });
  }

  async getFileSegment(fileId: string, segmentId: string) {
    return this.api.getFileSegment({
      params: { file_id: fileId, segment_id: segmentId },
    });
  }

  async updateFileSegment(
    fileId: string,
    segmentId: string,
    body: { metadata?: Record<string, any> },
  ) {
    return this.api.updateFileSegment(body, {
      params: { file_id: fileId, segment_id: segmentId },
    });
  }

  async getFileTags(fileId: string) {
    return this.api.listFileTags({
      params: { file_id: fileId },
    });
  }

  async getFileSegmentTags(fileId: string, segmentId: string) {
    return this.api.listFileSegmentTags({
      params: { file_id: fileId, segment_id: segmentId },
    });
  }

  /**
   * Waits for a file to finish processing by polling the getFile endpoint until the file
   * reaches a terminal state (completed, failed, or not_applicable) or until maxAttempts is reached.
   *
   * @param fileId - The ID of the file to wait for
   * @param options - Optional configuration for polling behavior
   * @returns The final file object
   * @throws {CloudGlueError} If the file fails to process or maxAttempts is reached
   */
  async waitForReady(fileId: string, options: WaitForReadyOptions = {}) {
    const { pollingInterval = 5000, maxAttempts = 36 } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const file = await this.getFile(fileId);

      // If we've reached a terminal state, return the file
      if (['completed', 'failed', 'not_applicable'].includes(file.status)) {
        if (file.status === 'failed') {
          throw new CloudGlueError(`File processing failed: ${fileId}`);
        }
        return file;
      }

      // Wait for the polling interval before trying again
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudGlueError(
      `Timeout waiting for file ${fileId} to process after ${maxAttempts} attempts`,
    );
  }
}
