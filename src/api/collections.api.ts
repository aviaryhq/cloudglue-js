import { CollectionsApi } from '../../generated';
import { Filter, Modalities, SegmentationConfig } from '../types';
import { ThumbnailsConfig } from '../../generated/common';
import { CloudGlueError } from '../error';
import { WaitForReadyOptions } from '../types';
import { schemas as collectionsSchemas } from '../../generated/Collections';
import z from 'zod';

type PaginationParams = {
  limit?: number;
  offset?: number;
};

type OrderParams = {
  order?: 'added_at' | 'filename';
  sort?: 'asc' | 'desc';
};

type AddedFilterParams = {
  added_before?: string;
  added_after?: string;
};

type ListCollectionEntitiesParams = AddedFilterParams &
  OrderParams &
  PaginationParams;

type ListCollectionMediaDescriptionsParams = {
  response_format?: 'json' | 'markdown';
  modalities?: Modalities[];
} & AddedFilterParams &
  OrderParams &
  PaginationParams;

type ListCollectionParams = {
  collection_type?:
    | 'entities'
    | 'rich-transcripts'
    | 'media-descriptions'
    | 'face-analysis';
  order?: 'name' | 'created_at';
} & PaginationParams;

type ListCollectionVideosParams = {
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable';
  filter?: Filter;
} & OrderParams &
  PaginationParams &
  AddedFilterParams;

export class EnhancedCollectionsApi {
  constructor(private readonly api: typeof CollectionsApi) {}

  async listCollections(params: ListCollectionParams) {
    return this.api.listCollections({ queries: params });
  }

  async createCollection(
    params: z.infer<typeof collectionsSchemas.NewCollection>,
  ) {
    return this.api.createCollection(params);
  }

  async getCollection(collectionId: string) {
    return this.api.getCollection({
      params: { collection_id: collectionId },
    });
  }

  async deleteCollection(collectionId: string) {
    return this.api.deleteCollection(undefined, {
      params: { collection_id: collectionId },
    });
  }

  async updateCollection(
    collectionId: string,
    params: {
      name?: string;
      description?: string;
    },
  ) {
    return this.api.updateCollection(params, {
      params: { collection_id: collectionId },
    });
  }

  async addVideoByUrl({
    collectionId,
    url,
    params,
  }: {
    collectionId: string;
    url: string;
    params: {
      segmentation_config?: SegmentationConfig;
      segmentation_id?: string;
      metadata?: Record<string, any>;
      thumbnail_config?: ThumbnailsConfig;
    };
  }) {
    return this.api.addVideo(
      { url, ...params },
      { params: { collection_id: collectionId, ...params } },
    );
  }

  async addVideo(
    collectionId: string,
    fileId: string,
    params: {
      segmentation_config?: SegmentationConfig;
      segmentation_id?: string;
      metadata?: Record<string, any>;
      thumbnail_config?: ThumbnailsConfig;
    } = {},
  ) {
    return this.api.addVideo(
      { file_id: fileId, ...params },
      { params: { collection_id: collectionId, ...params } },
    );
  }

  async listVideos(
    collectionId: string,
    params: ListCollectionVideosParams = {},
  ) {
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

    return this.api.listVideos({
      params: { collection_id: collectionId },
      queries,
    });
  }

  async getVideo(collectionId: string, fileId: string) {
    return this.api.getVideo({
      params: { collection_id: collectionId, file_id: fileId },
    });
  }

  async deleteVideo(collectionId: string, fileId: string) {
    return this.api.deleteVideo(undefined, {
      params: { collection_id: collectionId, file_id: fileId },
    });
  }

  async getEntities(
    collectionId: string,
    fileId: string,
    params: { limit?: number; offset?: number } = {},
  ) {
    return this.api.getEntities({
      params: { collection_id: collectionId, file_id: fileId },
      queries: params,
    });
  }

  async getTranscripts(
    collectionId: string,
    fileId: string,
    options: {
      limit?: number;
      offset?: number;
      response_format?: 'markdown' | 'json';
      start_time_seconds?: number;
      end_time_seconds?: number;
      modalities?: Modalities[];
    } = {},
  ) {
    return this.api.getTranscripts({
      params: { collection_id: collectionId, file_id: fileId },
      queries: { ...options },
    } as any);
  }

  async listEntities(
    collectionId: string,
    params: ListCollectionEntitiesParams = {},
  ) {
    return this.api.listCollectionEntities({
      params: { collection_id: collectionId },
      queries: params,
    });
  }

  async listRichTranscripts(
    collectionId: string,
    params: ListCollectionMediaDescriptionsParams = {},
  ) {
    return this.api.listCollectionRichTranscripts({
      params: { collection_id: collectionId },
      queries: params,
    });
  }

  async getMediaDescriptions(
    collectionId: string,
    fileId: string,
    options: {
      response_format?: 'markdown' | 'json';
      start_time_seconds?: number;
      end_time_seconds?: number;
    } = {},
  ) {
    return this.api.getMediaDescriptions({
      params: { collection_id: collectionId, file_id: fileId },
      queries: { ...options },
    } as any);
  }

  async getFaceDetections(
    collectionId: string,
    fileId: string,
    params: { limit?: number; offset?: number } = {},
  ) {
    return this.api.getFaceDetections({
      params: { collection_id: collectionId, file_id: fileId },
      queries: params,
    });
  }

  async listMediaDescriptions(
    collectionId: string,
    params: ListCollectionMediaDescriptionsParams = {},
  ) {
    return this.api.listCollectionMediaDescriptions({
      params: { collection_id: collectionId },
      queries: params,
    });
  }

  /**
   * Waits for a video in a collection to be ready by polling the getVideo endpoint until
   * the video reaches a terminal state (completed, failed, or not_applicable) or until maxAttempts is reached.
   *
   * @param collectionId - The ID of the collection containing the video
   * @param fileId - The ID of the video file to wait for
   * @param options - Optional configuration for polling behavior
   * @returns The final collection file object
   * @throws {CloudGlueError} If the video fails to process or maxAttempts is reached
   */
  async waitForReady(
    collectionId: string,
    fileId: string,
    options: WaitForReadyOptions = {},
  ) {
    const { pollingInterval = 5000, maxAttempts = 36 } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const video = await this.getVideo(collectionId, fileId);

      // If we've reached a terminal state, return the video
      if (['completed', 'failed', 'not_applicable'].includes(video.status)) {
        if (video.status === 'failed') {
          throw new CloudGlueError(
            `Video processing failed: ${fileId} in collection ${collectionId}`,
          );
        }
        return video;
      }

      // Wait for the polling interval before trying again
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudGlueError(
      `Timeout waiting for video ${fileId} in collection ${collectionId} to process after ${maxAttempts} attempts`,
    );
  }
}
