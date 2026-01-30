import { SegmentationsApi } from '../../generated';
import { ThumbnailType } from '../types';

export class EnhancedSegmentationsApi {
  constructor(private readonly api: typeof SegmentationsApi) {}

  async getSegmentation(
    segmentationId: string,
    params: {
      limit?: number;
      offset?: number;
    } = {},
  ) {
    return this.api.getSegmentation({
      params: { segmentation_id: segmentationId },
      queries: params,
    });
  }
  async deleteSegmentation(segmentationId: string) {
    return this.api.deleteSegmentation(undefined, {
      params: { segmentation_id: segmentationId },
    });
  }

  /**
   * Get thumbnails for a specific segmentation
   * @param segmentationId - The ID of the segmentation
   * @param params - Optional parameters
   * @returns The thumbnails for the segmentation
   */
  async getSegmentationThumbnails(
    segmentationId: string,
    params: {
      limit?: number;
      offset?: number;
      /**
       * The IDs of the segments to get thumbnails for. If not provided, all segments will be used.
       */
      segment_ids?: string[];
      type?: ThumbnailType[];
    } = {},
  ) {
    return this.api.getSegmentationThumbnails({
      params: { segmentation_id: segmentationId },
      queries: {
        ...params,
        segment_ids: params.segment_ids?.join(','),
        type: params.type?.join(','),
      },
    });
  }

  /**
   * List all describe jobs that referenced the specified segmentation.
   * Returns describe job records associated with the segmentation.
   * @param segmentationId - The ID of the segmentation
   * @param params - Optional parameters for filtering and pagination
   * @returns List of describe jobs for the segmentation
   */
  async listSegmentationDescribes(
    segmentationId: string,
    params: {
      include_data?: boolean;
      response_format?: 'json' | 'markdown';
      limit?: number;
      offset?: number;
    } = {},
  ) {
    return this.api.listSegmentationDescribes({
      params: { segmentation_id: segmentationId },
      queries: params,
    });
  }
}
