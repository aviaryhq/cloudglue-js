import { ShareApi } from '../../generated';

export class EnhancedShareableApi {
  constructor(private readonly api: typeof ShareApi) {}

  async listShareableAssets(data: {
    limit?: number;
    offset?: number;
    createdBefore?: string;
    createdAfter?: string;
    fileId?: string;
    fileSegmentId?: string;
  }) {
    return this.api.listShareableAssets({ queries: data });
  }

  async createShareableAsset(data: {
    file_id: string;
    file_segment_id?: string;
    title?: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.api.createShareableAsset(data);
  }

  async getShareableAsset(id: string) {
    return this.api.getShareableAsset({
      params: { id },
    });
  }

  async updateShareableAsset(
    id: string,
    data: {
      title?: string;
      description?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    return this.api.updateShareableAsset(data, {
      params: { id },
    });
  }

  async deleteShareableAsset(id: string) {
    return this.api.deleteShareableAsset(undefined, {
      params: { id },
    });
  }

  async getFileShareableAsset(
    fileId: string,
    queries: {
      limit?: number;
      offset?: number;
      createdBefore?: string;
      createdAfter?: string;
    },
  ) {
    return this.api.listShareableAssets({
      queries: { file_id: fileId, ...queries },
    });
  }

  async getFileSegmentShareableAsset(
    fileId: string,
    segmentId: string,
    queries: {
      limit?: number;
      offset?: number;
      createdBefore?: string;
      createdAfter?: string;
    },
  ) {
    return this.api.listShareableAssets({
      queries: { file_id: fileId, file_segment_id: segmentId, ...queries },
    });
  }
}
