import { SegmentationsApi } from "../../generated";

export class EnhancedSegmentationsApi {
  constructor(private readonly api: typeof SegmentationsApi) {}

  async getSegmentation(segmentationId: string, params: {
    limit?: number;
    offset?: number;
  } = {}) {
    return this.api.getSegmentation({
      params: { segmentation_id: segmentationId },
      queries: params,
    });
  }
  async deleteSegmentation(segmentationId: string) {
    return this.api.deleteSegmentation(undefined,{
      params: { segmentation_id: segmentationId },
    });
  }

  /**
   * Get thumbnails for a specific segmentation
   * @param segmentationId - The ID of the segmentation
   * @param params - Optional parameters
   * @returns The thumbnails for the segmentation
   */
  async getSegmentationThumbnails(segmentationId: string, params: {
    limit?: number;
    offset?: number;
    /**
     * The IDs of the segments to get thumbnails for. If not provided, all segments will be used.
     */
    segment_ids?: string[]
  } = {}) {
    return this.api.getSegmentationThumbnails({
      params: { segmentation_id: segmentationId },
      queries: {
        ...params,
        segment_ids: params.segment_ids?.join(","),
      },
    });
  }
}