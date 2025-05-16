import type { AxiosRequestConfig } from 'axios';
import {
  FilesApi,
  CollectionsApi,
  ChatApi,
  TranscribeApi,
  ExtractApi
} from '../generated';
import type { File } from './types';

export class CloudGlueError extends Error {
  constructor(message: string, public readonly statusCode?: number, public readonly data?: string, public readonly headers?: Record<string, any>) {
    super(message);
  }
}

/**
 * Configuration options for initializing the CloudGlue client
 */
export interface CloudGlueConfig {
  apiKey?: string;
  baseUrl?: string;
}

// Enhanced API interfaces with flattened parameters
interface ListFilesParams {
  status?: 'pending' | 'processing' | 'ready' | 'completed' | 'failed' | 'not_applicable';
  limit?: number;
  offset?: number;
  order?: 'created_at' | 'filename';
  sort?: 'asc' | 'desc';
}

interface UploadFileParams {
  file: globalThis.File;
  metadata?: Record<string, any>;
}

interface ListCollectionParams {
  limit?: number;
  offset?: number;
  order?: 'name' | 'created_at';
  sort?: 'asc' | 'desc';
}

interface CreateCollectionParams {
  name: string;
  description?: string;
  extract_config?: {
    prompt?: string;
    schema?: Record<string, any>;
  };
}

interface ListCollectionVideosParams {
  limit?: number;
  offset?: number;
  status?: 'pending' | 'processing' | 'ready' | 'completed' | 'failed' | 'not_applicable';
  order?: 'added_at' | 'filename';
  sort?: 'asc' | 'desc';
}

interface ChatCompletionParams {
  model?: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
    name?: string;
  }>;
  collections: string[];
  filter?: {
    metadata?: Array<{
      path: string;
      operator: 'NotEqual' | 'Equal' | 'LessThan' | 'GreaterThan' | 'In' | 'ContainsAny' | 'ContainsAll';
      valueText?: string;
      valueTextArray?: string[];
    }>;
  };
  force_search?: boolean;
  result_format?: 'text' | 'markdown' | 'json';
  include_citations?: boolean;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}



// Enhanced API client classes
class EnhancedFilesApi {
  constructor(private readonly api: typeof FilesApi) {}

  async listFiles(params: ListFilesParams = {}) {
    return this.api.listFiles({ queries: params } as any);
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
      formData.append('metadata', JSON.stringify(params.metadata));
    }

    // Use axios directly to bypass Zodios validation
    return this.api.axios({
      method: 'post',
      url: '/files',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  async getFile(fileId: string) {
    return this.api.getFile({ params: { file_id: fileId } } as any);
  }

  async deleteFile(fileId: string) {
    return this.api.deleteFile({ params: { file_id: fileId } } as any, { params: { file_id: fileId } });
  }
}

class EnhancedCollectionsApi {
  constructor(private readonly api: typeof CollectionsApi) {}

  async listCollections(params: ListCollectionParams = {}) {
    return this.api.listCollections({ queries: params } as any);
  }

  async createCollection(params: CreateCollectionParams) {
    return this.api.createCollection(params as any);
  }

  async getCollection(collectionId: string) {
    return this.api.getCollection({ params: { collection_id: collectionId } } as any);
  }

  async deleteCollection(collectionId: string) {
    return this.api.deleteCollection({ params: { collection_id: collectionId } } as any, { params: { collection_id: collectionId } });
  }

  async addVideo(collectionId: string, fileId: string) {
    return this.api.addVideo({ file_id: fileId }, { params: { collection_id: collectionId } });
  }

  async listVideos(collectionId: string, params: ListCollectionVideosParams = {}) {
    return this.api.listVideos({
      params: { collection_id: collectionId },
      queries: params
    } as any);
  }

  async getVideo(collectionId: string, fileId: string) {
    return this.api.getVideo({
      params: { collection_id: collectionId, file_id: fileId }
    } as any);
  }

  async deleteVideo(collectionId: string, fileId: string) {
    return this.api.deleteVideo({
      params: { collection_id: collectionId, file_id: fileId }
    } as any, { params: { collection_id: collectionId, file_id: fileId } });
  }

  async getEntities(collectionId: string, fileId: string, limit?: number, offset?: number) {
    return this.api.getEntities({
      params: { collection_id: collectionId, file_id: fileId },
      queries: { limit, offset }
    } as any);
  }

  // TODO: Remove this once we have a new endpoint for this setup
  async getDescription(collectionId: string, fileId: string, limit?: number, offset?: number) {
    return this.api.getDescription({
      params: { collection_id: collectionId, file_id: fileId },
      queries: { limit, offset }
    } as any);
  }

  async addYouTubeVideo(collectionId: string, url: string, metadata?: Record<string, any>) {
    return this.api.addYouTubeVideo({ url, metadata }, { params: { collection_id: collectionId } });
  }
}

class EnhancedChatApi {
  constructor(private readonly api: typeof ChatApi) {}

  async createCompletion(params: ChatCompletionParams) {
    return this.api.createCompletion({
      model: params.model || 'nimbus-001',
      ...params
    } as any);
  }
}

class EnhancedTranscribeApi {
  constructor(private readonly api: typeof TranscribeApi) {}

  async createTranscribe(url: string, options: {
    enable_summary?: boolean;
    enable_speech?: boolean;
    enable_scene_text?: boolean;
    enable_visual_scene_description?: boolean;
  } = {}) {
    return this.api.createTranscribe({
      url,
      ...options
    } as any);
  }

  async getTranscribe(jobId: string, options: {
    response_format?: 'json' | 'markdown';
  } = {}) {
    return this.api.getTranscribe({ 
      params: { job_id: jobId },
      queries: { response_format: options.response_format }
    } as any);
  }

  async listTranscribes(params: {
    limit?: number;
    offset?: number;
    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable';
    created_before?: string;
    created_after?: string;
    response_format?: 'json' | 'markdown';
  } = {}) {
    return this.api.listTranscribes({ queries: params } as any);
  }
}

class EnhancedExtractApi {
  constructor(private readonly api: typeof ExtractApi) {}

  async createExtract(url: string, options?: {
    prompt?: string;
    schema?: Record<string, any>;
  }) {
    return this.api.createExtract({
      url,
      ...options
    } as any);
  }

  async getExtract(jobId: string) {
    return this.api.getExtract({ params: { job_id: jobId } } as any);
  }
}

/**
 * Main CloudGlue client class that provides access to all API functionality
 * through enhanced, user-friendly interfaces
 */
export class CloudGlue {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  
  /**
   * Files API for managing video files
   * Provides methods for uploading, listing, and managing video files
   */
  public readonly files: EnhancedFilesApi;

  /**
   * Collections API for organizing videos into collections
   * Provides methods for creating and managing collections of videos
   */
  public readonly collections: EnhancedCollectionsApi;

  /**
   * Chat API for interacting with videos through natural language
   * Provides methods for querying and getting responses about video content
   */
  public readonly chat: EnhancedChatApi;

  /**
   * Transcribe API for generating rich descriptions of videos
   * Provides methods for getting detailed descriptions of video content
   */
  public readonly transcribe: EnhancedTranscribeApi;

  /**
   * Extract API for extracting structured data from videos
   * Provides methods for extracting specific information from video content
   */
  public readonly extract: EnhancedExtractApi;

  constructor(config: CloudGlueConfig = {}) {
    this.apiKey = config.apiKey || process.env.CLOUDGLUE_API_KEY || '';
    this.baseUrl = config.baseUrl || 'https://api.cloudglue.dev/v1';

    if (!this.apiKey) {
      throw new Error('API key is required. Please provide an API key via constructor or CLOUDGLUE_API_KEY environment variable.');
    }

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.apiKey}`
      }
    };

    // Initialize all API clients with the configured base URL and auth
    const filesApi = FilesApi;
    const collectionsApi = CollectionsApi;
    const chatApi = ChatApi;
    const transcribeApi = TranscribeApi;
    const extractApi = ExtractApi;

    // Configure base URL and axios config for all clients
    [filesApi, collectionsApi, chatApi, transcribeApi, extractApi].forEach(client => {
      client.axios.defaults.baseURL = this.baseUrl;
      client.axios.interceptors.response.use(
        (response) => {
          return response;
        },
        (error) => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const data = error.response.data as { error: string };

            return Promise.reject(new CloudGlueError(data.error, error.response.status, error.config.data, error.response.headers));
          }

          // Something happened in setting up the request that triggered an Error
          return Promise.reject(new CloudGlueError(error.message, error.statusCode ?? 500, error.data, error.headers));
        }
      );
      Object.assign(client.axios.defaults, axiosConfig);
    });

    // Create enhanced API clients
    this.files = new EnhancedFilesApi(filesApi);
    this.collections = new EnhancedCollectionsApi(collectionsApi);
    this.chat = new EnhancedChatApi(chatApi);
    this.transcribe = new EnhancedTranscribeApi(transcribeApi);
    this.extract = new EnhancedExtractApi(extractApi);
  }
}
