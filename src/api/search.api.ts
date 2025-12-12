import { SearchApi } from '../../generated';
import { SearchRequest } from '../types';

export class EnhancedSearchApi {
  constructor(private readonly api: typeof SearchApi) {}

  async searchContent(params: SearchRequest) {
    return this.api.searchContent(params);
  }

  async listSearchResponses(params: { limit?: number; offset?: number }) {
    return this.api.getSearch({
      queries: params,
    });
  }

  async getSearchResponse(searchId: string) {
    return this.api.getSearchById({
      params: { search_id: searchId },
    });
  }
}
