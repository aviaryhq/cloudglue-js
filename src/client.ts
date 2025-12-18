import type { AxiosRequestConfig } from 'axios';
import type { CloudGlueConfig } from './types';
import { createApiClient as createFilesApiClient } from '../generated/Files';
import { createApiClient as createCollectionsApiClient } from '../generated/Collections';
import { createApiClient as createChatApiClient } from '../generated/Chat';
import { createApiClient as createTranscribeApiClient } from '../generated/Transcribe';
import { createApiClient as createExtractApiClient } from '../generated/Extract';
import { createApiClient as createSegmentationsApiClient } from '../generated/Segmentations';
import { createApiClient as createSearchApiClient } from '../generated/Search';
import { createApiClient as createDescribeApiClient } from '../generated/Describe';
import { createApiClient as createSegmentsApiClient } from '../generated/Segments';
import { createApiClient as createWebhooksApiClient } from '../generated/Webhooks';
import { createApiClient as createFramesApiClient } from '../generated/Frames';
import { createApiClient as createFaceDetectionApiClient } from '../generated/Face_Detection';
import { createApiClient as createFaceMatchApiClient } from '../generated/Face_Match';
import { createApiClient as createTagsApiClient } from '../generated/Tags';
import { ZodiosOptions } from '@zodios/core';
import { EnhancedWebhooksApi } from './api/webhooks.api';
import { EnhancedTagsApi } from './api/tags.api';
import { CloudGlueError } from './error';
import { EnhancedFilesApi } from './api/files.api';
import { EnhancedDescribeApi } from './api/describe.api';
import { EnhancedExtractApi } from './api/extract.api';
import { EnhancedFaceDetectionApi } from './api/face-detection.api';
import { EnhancedFaceMatchApi } from './api/face-match.api';
import { EnhancedFramesApi } from './api/frame-extraction.api';
import { EnhancedSearchApi } from './api/search.api';
import { EnhancedSegmentationsApi } from './api/segmentations.api';
import { EnhancedSegmentsApi } from './api/segments.api';
import { EnhancedTranscribeApi } from './api/transcribe.api';
import { EnhancedChatApi } from './api/chat-completion.api';
import { EnhancedCollectionsApi } from './api/collections.api';

/**
 * Main CloudGlue client class that provides access to all API functionality
 * through enhanced, user-friendly interfaces
 */
export class CloudGlue {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number | undefined;
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

  /**
   * Segmentations API for segmenting videos into shots
   * Provides methods for segmenting videos into shots
   */
  public readonly segmentations: EnhancedSegmentationsApi;

  /**
   * Search API for searching video content
   * Provides methods for searching videos and video segments in collections
   */
  public readonly search: EnhancedSearchApi;

  /**
   * Describe API for generating rich descriptions of videos
   * Provides methods for getting detailed descriptions of video content
   */
  public readonly describe: EnhancedDescribeApi;

  public readonly segments: EnhancedSegmentsApi;

  /**
   * Frames API for managing frame extractions
   * Provides methods for extracting and managing video frames
   */
  public readonly frames: EnhancedFramesApi;

  /**
   * Face Detection API for detecting faces in videos
   * Provides methods for analyzing videos to detect faces
   */
  public readonly faceDetection: EnhancedFaceDetectionApi;

  /**
   * Face Match API for matching faces across videos
   * Provides methods for finding specific faces in videos
   */
  public readonly faceMatch: EnhancedFaceMatchApi;

  /**
   * Webhooks API for managing webhooks
   * Provides methods for creating and managing webhooks
   */
  public readonly webhooks: EnhancedWebhooksApi;

  /**
   * Tags API for managing tags
   * Provides methods for creating and managing tags
   */
  public readonly tags: EnhancedTagsApi;

  constructor(config: CloudGlueConfig = {}) {
    this.apiKey = config.apiKey || process.env.CLOUDGLUE_API_KEY || '';
    this.baseUrl = config.baseUrl || 'https://api.cloudglue.dev/v1';
    this.timeout = config.timeout || undefined;
    if (!this.apiKey) {
      throw new Error(
        'API key is required. Please provide an API key via constructor or CLOUDGLUE_API_KEY environment variable.',
      );
    }

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'x-sdk-client': 'cloudglue-js',
        'x-sdk-version': '__SDK_VERSION__',
      },
      baseURL: this.baseUrl,
      timeout: this.timeout,
    };

    // Let all validation happen on the server side
    const sharedConfig: ZodiosOptions = {
      validate: false,
      transform: false,
      sendDefaults: true,
    };

    // Initialize all API clients with the configured base URL and auth
    const filesApi = createFilesApiClient(this.baseUrl, sharedConfig);
    const collectionsApi = createCollectionsApiClient(
      this.baseUrl,
      sharedConfig,
    );
    const chatApi = createChatApiClient(this.baseUrl, sharedConfig);
    const transcribeApi = createTranscribeApiClient(this.baseUrl, sharedConfig);
    const extractApi = createExtractApiClient(this.baseUrl, sharedConfig);
    const segmentationsApi = createSegmentationsApiClient(
      this.baseUrl,
      sharedConfig,
    );
    const searchApi = createSearchApiClient(this.baseUrl, sharedConfig);
    const describeApi = createDescribeApiClient(this.baseUrl, sharedConfig);
    const segmentsApi = createSegmentsApiClient(this.baseUrl, sharedConfig);
    const framesApi = createFramesApiClient(this.baseUrl, sharedConfig);
    const faceDetectionApi = createFaceDetectionApiClient(
      this.baseUrl,
      sharedConfig,
    );
    const faceMatchApi = createFaceMatchApiClient(this.baseUrl, sharedConfig);
    const webhooksApi = createWebhooksApiClient(this.baseUrl, sharedConfig);
    const tagsApi = createTagsApiClient(this.baseUrl, sharedConfig);
    // Configure base URL and axios config for all clients
    [
      filesApi,
      collectionsApi,
      chatApi,
      transcribeApi,
      extractApi,
      segmentationsApi,
      searchApi,
      describeApi,
      segmentsApi,
      framesApi,
      faceDetectionApi,
      faceMatchApi,
      webhooksApi,
      tagsApi,
    ].forEach((client) => {
      Object.assign(client.axios.defaults, axiosConfig);

      client.axios.interceptors.response.use(
        (response) => {
          return response;
        },
        (error) => {
          if (error.code === 'ECONNABORTED') {
            return Promise.reject(
              new CloudGlueError(
                error.message,
                408,
                error.config.data,
                error.response?.headers ?? error.headers,
                error.response?.data,
              ),
            );
          } else if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const data = error.response.data as { error: string };

            return Promise.reject(
              new CloudGlueError(
                data.error,
                error.response.status,
                error.config.data,
                error.response.headers,
                error.response.data,
              ),
            );
          }

          // Something happened in setting up the request that triggered an Error
          return Promise.reject(
            new CloudGlueError(
              error.message,
              error.statusCode ?? 500,
              error.data,
              error.headers,
              error.response?.data,
            ),
          );
        },
      );
    });

    // Create enhanced API clients
    this.files = new EnhancedFilesApi(filesApi);
    this.collections = new EnhancedCollectionsApi(collectionsApi);
    this.chat = new EnhancedChatApi(chatApi);
    this.transcribe = new EnhancedTranscribeApi(transcribeApi);
    this.extract = new EnhancedExtractApi(extractApi);
    this.segmentations = new EnhancedSegmentationsApi(segmentationsApi);
    this.search = new EnhancedSearchApi(searchApi);
    this.describe = new EnhancedDescribeApi(describeApi);
    this.segments = new EnhancedSegmentsApi(segmentsApi);
    this.frames = new EnhancedFramesApi(framesApi);
    this.faceDetection = new EnhancedFaceDetectionApi(faceDetectionApi);
    this.faceMatch = new EnhancedFaceMatchApi(faceMatchApi);
    this.webhooks = new EnhancedWebhooksApi(webhooksApi);
    this.tags = new EnhancedTagsApi(tagsApi);
  }
}
