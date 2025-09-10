import type { AxiosRequestConfig } from "axios";
import {
  FilesApi,
  CollectionsApi,
  ChatApi,
  TranscribeApi,
  ExtractApi,
  SearchApi,
  DescribeApi,
} from "../generated";
import type { File, SegmentationConfig, UpdateFileParams } from "./types";
import { createApiClient as createFilesApiClient } from "../generated/Files";
import { createApiClient as createCollectionsApiClient } from "../generated/Collections";
import { createApiClient as createChatApiClient } from "../generated/Chat";
import { createApiClient as createTranscribeApiClient } from "../generated/Transcribe";
import { createApiClient as createExtractApiClient } from "../generated/Extract";
import { createApiClient as createSegmentationsApiClient, SegmentationsApi } from "../generated/Segmentations";
import { createApiClient as createSearchApiClient } from "../generated/Search";
import { createApiClient as createDescribeApiClient } from "../generated/Describe";
import { ZodiosOptions } from "@zodios/core";
import { ThumbnailsConfig } from "../generated/common";

export class CloudGlueError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly data?: string,
    public readonly headers?: Record<string, any>,
    public readonly responseData?: any
  ) {
    super(message);
  }
}

/**
 * Configuration options for initializing the CloudGlue client
 */
export interface CloudGlueConfig {
  // Cloudglue API Key
  apiKey?: string;
  baseUrl?: string;
  /**
   * Time limit in milliseconds before we timeout a request
   */
  timeout?: number;
}

// Enhanced API interfaces with flattened parameters
interface ListFilesParams {
  status?:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "not_applicable";
  limit?: number;
  offset?: number;
  order?: "created_at" | "filename";
  sort?: "asc" | "desc";
  created_before?: string;
  created_after?: string;
}

interface UploadFileParams {
  file: globalThis.File;
  metadata?: Record<string, any>;
  /**
   * If enabled, the file will be segmented and thumbnails will be generated for each segment for the default segmentation config.
   */
  enable_segment_thumbnails?: boolean;
}

interface ListCollectionParams {
  limit?: number;
  offset?: number;
  order?: "name" | "created_at";
  sort?: "asc" | "desc";
  collection_type?: "entities" | "rich-transcripts" | "media-descriptions";
}

interface CreateCollectionParams {
  collection_type: "entities" | "rich-transcripts" | "media-descriptions";
  name: string;
  description?: string;
  extract_config?: {
    prompt?: string;
    schema?: Record<string, any>;
    enable_video_level_entities?: boolean;
    enable_segment_level_entities?: boolean;
  };
  transcribe_config?: {
    enable_summary?: boolean;
    enable_speech?: boolean;
    enable_scene_text?: boolean;
    enable_visual_scene_description?: boolean;
  };
  describe_config?: {
    enable_summary?: boolean;
    enable_speech?: boolean;
    enable_scene_text?: boolean;
    enable_visual_scene_description?: boolean;
  };
  default_segmentation_config?: SegmentationConfig;   
  default_thumbnails_config?: ThumbnailsConfig;
}

interface ListCollectionVideosParams {
  limit?: number;
  offset?: number;
  status?:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "not_applicable";
  order?: "added_at" | "filename";
  sort?: "asc" | "desc";
  added_before?: string;
  added_after?: string;
}

interface ListCollectionEntitiesParams {
  limit?: number;
  offset?: number;
  order?: "added_at" | "filename";
  sort?: "asc" | "desc";
  added_before?: string;
  added_after?: string;
}

interface ListCollectionRichTranscriptsParams {
  limit?: number;
  offset?: number;
  order?: "added_at" | "filename";
  sort?: "asc" | "desc";
  added_before?: string;
  added_after?: string;
  response_format?: "json" | "markdown";
}

interface ListCollectionMediaDescriptionsParams {
  limit?: number;
  offset?: number;
  order?: "added_at" | "filename";
  sort?: "asc" | "desc";
  added_before?: string;
  added_after?: string;
  response_format?: "json" | "markdown";
}

interface ChatCompletionParams {
  model?: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
    name?: string;
  }>;
  collections: string[];
  filter?: {
    metadata?: Array<{
      path: string;
      operator:
        | "NotEqual"
        | "Equal"
        | "LessThan"
        | "GreaterThan"
        | "In"
        | "ContainsAny"
        | "ContainsAll";
      valueText?: string;
      valueTextArray?: string[];
    }>;
    video_info?: Array<{
      path: string;
      operator:
        | "NotEqual"
        | "Equal"
        | "LessThan"
        | "GreaterThan"
        | "In"
        | "ContainsAny"
        | "ContainsAll";
      valueText?: string;
      valueTextArray?: string[];
    }>;
    file?: Array<{
      path: string;
      operator:
        | "NotEqual"
        | "Equal"
        | "LessThan"
        | "GreaterThan"
        | "In"
        | "ContainsAny"
        | "ContainsAll";
      valueText?: string;
      valueTextArray?: string[];
    }>;
  };
  temperature?: number;
}

interface SearchParams {
  scope: "file" | "segment";
  collections: string[];
  query: string;
  limit?: number;
  filter?: {
    metadata?: Array<{
      path: string;
      operator:
        | "NotEqual"
        | "Equal"
        | "LessThan"
        | "GreaterThan"
        | "ContainsAny"
        | "ContainsAll"
        | "In";
      valueText?: string;
      valueTextArray?: string[];
    }>;
    video_info?: Array<{
      path: "duration_seconds" | "has_audio";
      operator:
        | "NotEqual"
        | "Equal"
        | "LessThan"
        | "GreaterThan"
        | "ContainsAny"
        | "ContainsAll"
        | "In";
      valueText?: string;
      valueTextArray?: string[];
    }>;
    file?: Array<{
      path: "bytes" | "filename" | "uri" | "created_at" | "id";
      operator:
        | "NotEqual"
        | "Equal"
        | "LessThan"
        | "GreaterThan"
        | "ContainsAny"
        | "ContainsAll"
        | "In";
      valueText?: string;
      valueTextArray?: string[];
    }>;
  };
}

interface WaitForReadyOptions {
  /** Interval in milliseconds between polling attempts. Defaults to 5000ms (5 seconds). */
  pollingInterval?: number;
  /** Maximum number of polling attempts before giving up. Defaults to 36 (3 minutes total with default interval). */
  maxAttempts?: number;
}

// Enhanced API client classes
class EnhancedFilesApi {
  constructor(private readonly api: typeof FilesApi) {}

  async listFiles(params: ListFilesParams = {}) {
    return this.api.listFiles({ queries: params });
  }

  async uploadFile(params: UploadFileParams) {
    // File uploads require special handling for multipart/form-data that the generated Zodios client doesn't handle automatically.
    // We need to:
    // 1. Create a FormData object and append the file with the correct field name
    // 2. JSON stringify the metadata if present
    // 3. Set the correct Content-Type header
    // This is why we use axios directly instead of the generated client method.

    const formData = new FormData();
    formData.append("file", params.file);

    // Add metadata if provided
    if (params.metadata) {
      formData.append("metadata", JSON.stringify(params.metadata));
    }
    if (params.enable_segment_thumbnails !== undefined) {
      formData.append("enable_segment_thumbnails", params.enable_segment_thumbnails.toString());
    }

    // Use axios directly to bypass Zodios validation
    return this.api.axios({
      method: "post",
      url: "/files",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
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
      { params: { file_id: fileId } }
    );
  }

  async listFileSegmentations(fileId: string, params: {limit?: number, offset?: number} = {}) {
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
  async getFileThumbnails(fileId: string, params: {limit?: number, offset?: number, isDefault?: boolean, segmentationId?: string} = {}) {
    return this.api.getThumbnails({
      params: { file_id: fileId },
      queries: {
        ...params,
        is_default: params.isDefault ?? false,
        segmentation_id: params.segmentationId ?? undefined,
      },
    });
  }

  async createFileSegmentation(fileId: string, params: SegmentationConfig) {
    return this.api.createFileSegmentation(params, {
      params: { file_id: fileId },
      body: params,
    } as any);
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
      if (["completed", "failed", "not_applicable"].includes(file.status)) {
        if (file.status === "failed") {
          throw new CloudGlueError(`File processing failed: ${fileId}`);
        }
        return file;
      }

      // Wait for the polling interval before trying again
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudGlueError(
      `Timeout waiting for file ${fileId} to process after ${maxAttempts} attempts`
    );
  }
}

class EnhancedCollectionsApi {
  constructor(private readonly api: typeof CollectionsApi) {}

  async listCollections(params: ListCollectionParams = {}) {
    return this.api.listCollections({ queries: params });
  }

  async createCollection(params: CreateCollectionParams) {
    return this.api.createCollection(params);
  }

  async getCollection(collectionId: string) {
    return this.api.getCollection({
      params: { collection_id: collectionId },
    });
  }

  async deleteCollection(collectionId: string) {
    return this.api.deleteCollection(
      undefined,
      { params: { collection_id: collectionId } }
    );
  }

  async addVideoByUrl({collectionId, url, params}: {collectionId: string, url: string, params: {
    segmentation_config?: SegmentationConfig;
    segmentation_id?: string;
    metadata?: Record<string, any>;
    thumbnail_config?: ThumbnailsConfig;
  }}) {
    return this.api.addVideo(
      { url, ...params },
      { params: { collection_id: collectionId, ...params } }
    );
  }

  async addVideo(collectionId: string, fileId: string, params: {
    segmentation_config?: SegmentationConfig;
    segmentation_id?: string;
    metadata?: Record<string, any>;
    thumbnail_config?: ThumbnailsConfig;
  } = {}) {
    return this.api.addVideo(
      { file_id: fileId, ...params },
      { params: { collection_id: collectionId, ...params } }
    );
  }

  async listVideos(
    collectionId: string,
    params: ListCollectionVideosParams = {}
  ) {
    return this.api.listVideos({
      params: { collection_id: collectionId },
      queries: params,
    });
  }

  async getVideo(collectionId: string, fileId: string) {
    return this.api.getVideo({
      params: { collection_id: collectionId, file_id: fileId },
    });
  }

  async deleteVideo(collectionId: string, fileId: string) {
    return this.api.deleteVideo(
      undefined,
      { params: { collection_id: collectionId, file_id: fileId } }
    );
  }

  async getEntities(
    collectionId: string,
    fileId: string
  ) {
    return this.api.getEntities({
      params: { collection_id: collectionId, file_id: fileId }
    });
  }

  async getTranscripts(
    collectionId: string,
    fileId: string,
    limit?: number,
    offset?: number,
    response_format?: "markdown" | "json"
  ) {
    return this.api.getTranscripts({
      params: { collection_id: collectionId, file_id: fileId },
      queries: { limit, offset, response_format },
    } as any);
  }

  async listEntities(
    collectionId: string,
    params: ListCollectionEntitiesParams = {}
  ) {
    return this.api.listCollectionEntities({
      params: { collection_id: collectionId },
      queries: params,
    });
  }

  async listRichTranscripts(
    collectionId: string,
    params: ListCollectionRichTranscriptsParams = {}
  ) {
    return this.api.listCollectionRichTranscripts({
      params: { collection_id: collectionId },
      queries: params,
    } );
  }

  async getMediaDescriptions(
    collectionId: string,
    fileId: string,
    response_format?: "markdown" | "json"
  ) {
    return this.api.getMediaDescriptions({
      params: { collection_id: collectionId, file_id: fileId },
      queries: { response_format },
    } as any);
  }

  async listMediaDescriptions(
    collectionId: string,
    params: ListCollectionMediaDescriptionsParams = {}
  ) {
    return this.api.listCollectionMediaDescriptions({
      params: { collection_id: collectionId },
      queries: params,
    } );
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
    options: WaitForReadyOptions = {}
  ) {
    const { pollingInterval = 5000, maxAttempts = 36 } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const video = await this.getVideo(collectionId, fileId);

      // If we've reached a terminal state, return the video
      if (["completed", "failed", "not_applicable"].includes(video.status)) {
        if (video.status === "failed") {
          throw new CloudGlueError(
            `Video processing failed: ${fileId} in collection ${collectionId}`
          );
        }
        return video;
      }

      // Wait for the polling interval before trying again
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudGlueError(
      `Timeout waiting for video ${fileId} in collection ${collectionId} to process after ${maxAttempts} attempts`
    );
  }
}

class EnhancedChatApi {
  constructor(private readonly api: typeof ChatApi) {}

  async createCompletion(params: ChatCompletionParams) {
    return this.api.createCompletion({
      model: params.model || "nimbus-001",
      ...params,
    } as any);
  }
}

class EnhancedTranscribeApi {
  constructor(private readonly api: typeof TranscribeApi) {}

  async createTranscribe(
    url: string,
    options: {
      enable_summary?: boolean;
      enable_speech?: boolean;
      enable_scene_text?: boolean;
      enable_visual_scene_description?: boolean;
      segmentation_config?: SegmentationConfig;
      segmentation_id?: string;
      thumbnail_config?: ThumbnailsConfig
    } = {}
  ) {
    return this.api.createTranscribe({
      url,
      ...options,
    });
  }

  async getTranscribe(
    jobId: string,
    options: {
      response_format?: "json" | "markdown";
    } = {}
  ) {
    return this.api.getTranscribe({
      params: { job_id: jobId },
      queries: { response_format: options.response_format },
    });
  }

  async listTranscribes(
    params: {
      limit?: number;
      offset?: number;
      status?:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "not_applicable";
      created_before?: string;
      created_after?: string;
      url?: string;
      response_format?: "json" | "markdown";
    } = {}
  ) {
    return this.api.listTranscribes({ queries: params });
  }

  /**
   * Waits for a transcription job to be ready by polling the getTranscribe endpoint until
   * the job reaches a terminal state (completed, failed, or not_applicable) or until maxAttempts is reached.
   *
   * @param jobId - The ID of the transcription job to wait for
   * @param options - Optional configuration for polling behavior and response format
   * @returns The final transcription job object
   * @throws {CloudGlueError} If the job fails to process or maxAttempts is reached
   */
  async waitForReady(
    jobId: string,
    options: WaitForReadyOptions & {
      response_format?: "json" | "markdown";
    } = {}
  ) {
    const {
      pollingInterval = 5000,
      maxAttempts = 36,
      response_format,
    } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const job = await this.getTranscribe(jobId, { response_format });

      // If we've reached a terminal state, return the job
      if (["completed", "failed", "not_applicable"].includes(job.status)) {
        if (job.status === "failed") {
          throw new CloudGlueError(`Transcription job failed: ${jobId}`);
        }
        return job;
      }

      // Wait for the polling interval before trying again
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudGlueError(
      `Timeout waiting for transcription job ${jobId} to process after ${maxAttempts} attempts`
    );
  }
}

class EnhancedExtractApi {
  constructor(private readonly api: typeof ExtractApi) {}

  async createExtract(
    url: string,
    options?: {
      prompt?: string;
      schema?: Record<string, any>;
      enable_video_level_entities?: boolean;
      enable_segment_level_entities?: boolean;
      segmentation_config?: SegmentationConfig;
      segmentation_id?: string;
      thumbnail_config?: ThumbnailsConfig
    }
  ) {
    return this.api.createExtract({
      url,
      ...options,
    });
  }

  async getExtract(jobId: string) {
    return this.api.getExtract({ params: { job_id: jobId } });
  }

  async listExtracts(
    params: {
      limit?: number;
      offset?: number;
      status?:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "not_applicable";
      created_before?: string;
      created_after?: string;
      url?: string;
    } = {}
  ) {
    return this.api.listExtracts({ queries: params });
  }

  /**
   * Waits for an extraction job to be ready by polling the getExtract endpoint until
   * the job reaches a terminal state (completed, failed, or not_applicable) or until maxAttempts is reached.
   *
   * @param jobId - The ID of the extraction job to wait for
   * @param options - Optional configuration for polling behavior
   * @returns The final extraction job object
   * @throws {CloudGlueError} If the job fails to process or maxAttempts is reached
   */
  async waitForReady(jobId: string, options: WaitForReadyOptions = {}) {
    const { pollingInterval = 5000, maxAttempts = 36 } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const job = await this.getExtract(jobId);

      // If we've reached a terminal state, return the job
      if (["completed", "failed", "not_applicable"].includes(job.status)) {
        if (job.status === "failed") {
          throw new CloudGlueError(`Extraction job failed: ${jobId}`);
        }
        return job;
      }

      // Wait for the polling interval before trying again
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudGlueError(
      `Timeout waiting for extraction job ${jobId} to process after ${maxAttempts} attempts`
    );
  }
}

class EnhancedSegmentationsApi {
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

class EnhancedSearchApi {
  constructor(private readonly api: typeof SearchApi) {}

  async searchContent(params: SearchParams) {
    return this.api.searchContent(params);
  }
}

class EnhancedDescribeApi {
  constructor(private readonly api: typeof DescribeApi) {}

  async createDescribe(
    url: string,
    options: {
      enable_summary?: boolean;
      enable_speech?: boolean;
      enable_scene_text?: boolean;
      enable_visual_scene_description?: boolean;
      segmentation_config?: SegmentationConfig;
      segmentation_id?: string;
      thumbnail_config?: ThumbnailsConfig
    } = {}
  ) {
    return this.api.createDescribe({
      url,
      ...options,
    });
  }

  async getDescribe(
    jobId: string,
    options: {
      response_format?: "json" | "markdown";
    } = {}
  ) {
    return this.api.getDescribe({
      params: { job_id: jobId },
      queries: { response_format: options.response_format },
    });
  }

  async listDescribes(
    params: {
      limit?: number;
      offset?: number;
      status?:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "not_applicable";
      created_before?: string;
      created_after?: string;
      url?: string;
      response_format?: "json" | "markdown";
    } = {}
  ) {
    return this.api.listDescribes({ queries: params });
  }

  /**
   * Waits for a description job to be ready by polling the getDescribe endpoint until
   * the job reaches a terminal state (completed, failed, or not_applicable) or until maxAttempts is reached.
   *
   * @param jobId - The ID of the description job to wait for
   * @param options - Optional configuration for polling behavior and response format
   * @returns The final description job object
   * @throws {CloudGlueError} If the job fails to process or maxAttempts is reached
   */
  async waitForReady(
    jobId: string,
    options: WaitForReadyOptions & {
      response_format?: "json" | "markdown";
    } = {}
  ) {
    const {
      pollingInterval = 5000,
      maxAttempts = 36,
      response_format,
    } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const job = await this.getDescribe(jobId, { response_format });

      // If we've reached a terminal state, return the job
      if (["completed", "failed", "not_applicable"].includes(job.status)) {
        if (job.status === "failed") {
          throw new CloudGlueError(`Description job failed: ${jobId}`);
        }
        return job;
      }

      // Wait for the polling interval before trying again
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudGlueError(
      `Timeout waiting for description job ${jobId} to process after ${maxAttempts} attempts`
    );
  }
}

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

  constructor(config: CloudGlueConfig = {}) {
    this.apiKey = config.apiKey || process.env.CLOUDGLUE_API_KEY || "";
    this.baseUrl = config.baseUrl || "https://api.cloudglue.dev/v1";
    this.timeout = config.timeout || undefined;
    if (!this.apiKey) {
      throw new Error(
        "API key is required. Please provide an API key via constructor or CLOUDGLUE_API_KEY environment variable."
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
    }

    // Initialize all API clients with the configured base URL and auth
    const filesApi = createFilesApiClient(this.baseUrl, sharedConfig);
    const collectionsApi = createCollectionsApiClient(this.baseUrl, sharedConfig);
    const chatApi = createChatApiClient(this.baseUrl, sharedConfig);
    const transcribeApi = createTranscribeApiClient(this.baseUrl, sharedConfig);
    const extractApi = createExtractApiClient(this.baseUrl, sharedConfig);
    const segmentationsApi = createSegmentationsApiClient(this.baseUrl, sharedConfig);
    const searchApi = createSearchApiClient(this.baseUrl, sharedConfig);
    const describeApi = createDescribeApiClient(this.baseUrl, sharedConfig);

    // Configure base URL and axios config for all clients
    [filesApi, collectionsApi, chatApi, transcribeApi, extractApi, segmentationsApi, searchApi, describeApi].forEach(
      (client) => {
        Object.assign(client.axios.defaults, axiosConfig);

        client.axios.interceptors.response.use(
          (response) => {
            return response;
          },
          (error) => {
            if (error.response) {
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
                )
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
              )
            );
          }
        );
      }
    );

    // Create enhanced API clients
    this.files = new EnhancedFilesApi(filesApi);
    this.collections = new EnhancedCollectionsApi(collectionsApi);
    this.chat = new EnhancedChatApi(chatApi);
    this.transcribe = new EnhancedTranscribeApi(transcribeApi);
    this.extract = new EnhancedExtractApi(extractApi);
    this.segmentations = new EnhancedSegmentationsApi(segmentationsApi);
    this.search = new EnhancedSearchApi(searchApi);
    this.describe = new EnhancedDescribeApi(describeApi);
    }
}
