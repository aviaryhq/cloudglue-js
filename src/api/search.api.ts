import { SearchApi } from '../../generated';
import { SearchRequest } from '../types';

export class EnhancedSearchApi {
  constructor(private readonly api: typeof SearchApi) {}

  async searchContent(params: SearchRequest) {
    return this.api.searchContent(params);
  }
}
