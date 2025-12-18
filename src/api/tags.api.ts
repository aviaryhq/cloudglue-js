import { TagsApi } from '../../generated';

export class EnhancedTagsApi {
  constructor(private readonly api: typeof TagsApi) {}

  async listTags(data: {
    type?: 'file' | 'segment';
    limit?: number;
    offset?: number;
  }) {
    return this.api.listTags({ queries: data });
  }

  async createTagForFile(
    fileId: string,
    data: {
      label: string;
      value: string;
    },
  ) {
    return this.api.createTag({ file_id: fileId, ...data });
  }

  async createTagForFileSegment(
    segmentId: string,
    fileId: string,
    data: {
      label: string;
      value: string;
    },
  ) {
    return this.api.createTag({
      file_id: fileId,
      segment_id: segmentId,
      ...data,
    });
  }

  async updateTag(
    tagId: string,
    data: {
      label: string;
      value: string;
      type: 'file' | 'segment';
    },
  ) {
    return this.api.updateTag(data, { params: { tag_id: tagId } });
  }

  async deleteTag(tagId: string) {
    return this.api.deleteTag(undefined, { params: { tag_id: tagId } });
  }

  async getTag(tagId: string) {
    return this.api.getTag({ params: { tag_id: tagId } });
  }
}
