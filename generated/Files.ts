import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';
import { File as CloudglueFile } from "./common";
import { Segmentation, SegmentationConfig, SegmentationUniformConfig, SegmentationShotDetectorConfig, SegmentationManualConfig, NarrativeConfig, KeyframeConfig, ThumbnailsConfig, Shot, Chapter, ThumbnailList, Thumbnail, ThumbnailType, ListVideoTagsResponse, PaginationResponse, VideoTag, FrameExtraction, FrameExtractionConfig, FrameExtractionUniformConfig, FrameExtractionThumbnailsConfig } from "./common";

type FileList = {
  object: 'list';
  data: Array<CloudglueFile>;
  total: number;
  limit: number;
  offset: number;
};
type SegmentationList = {
  object: 'list';
  data: Array<SegmentationListItem>;
  total: number;
  limit: number;
  offset: number;
};
type SegmentationListItem = {
  segmentation_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable';
  created_at: number;
  file_id: string;
  segmentation_config: SegmentationConfig;
  thumbnails_config: ThumbnailsConfig;
  total_segments?: number | undefined;
};
type FileSegmentListResponse = {
  object: 'list';
  data: Array<FileSegment>;
  total: number;
  limit: number;
  offset: number;
};
type FileSegment = {
  id: string;
  file_id: string;
  start_time: number;
  end_time: number;
  thumbnail_url: string;
  metadata?: {} | undefined;
  segmentation_id?: string | undefined;
};
type SegmentDescribeListResponse = {
  object: 'list';
  data: Array<SegmentDescribe>;
  total: number;
  limit: number;
  offset: number;
};
type SegmentDescribe = {
  job_id: string;
  segment_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable';
  describe_config: DescribeConfig;
  created_at: number;
  completed_at?: number | undefined;
  start_time: number;
  end_time: number;
  file_id: string;
  segmentation_id?: string | undefined;
  data?: (SegmentDescribeJsonData | SegmentDescribeMarkdownData) | undefined;
  object: 'segment_describe';
};
type DescribeConfig = Partial<{
  enable_summary: boolean;
  enable_speech: boolean;
  enable_visual_scene_description: boolean;
  enable_scene_text: boolean;
  enable_audio_description: boolean;
}>;
type SegmentDescribeJsonData = Partial<{
  visual_scene_description: Array<SegmentDescribeOutputEntry>;
  speech: Array<SegmentDescribeSpeechEntry>;
  scene_text: Array<SegmentDescribeOutputEntry>;
  audio_description: Array<SegmentDescribeOutputEntry>;
  title: string;
  summary: string;
  start_time: number;
  end_time: number;
  segment_id: string;
}>;
type SegmentDescribeOutputEntry = {
  text: string;
  start_time: number;
  end_time: number;
};
type SegmentDescribeSpeechEntry = {
  text: string;
  start_time: number;
  end_time: number;
  speaker?: string | undefined;
};
type SegmentDescribeMarkdownData = {
  content: string;
};
type FrameExtractionList = {
  object: 'list';
  data: Array<{
    frame_extraction_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: number;
    file_id: string;
    frame_extraction_config: FrameExtractionConfig;
    frame_count?: number | undefined;
  }>;
  total: number;
  limit: number;
  offset: number;
};

const FileList: z.ZodType<FileList> = z
  .object({
    object: z.literal('list'),
    data: z.array(CloudglueFile),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const SegmentDescribeOutputEntry: z.ZodType<SegmentDescribeOutputEntry> = z
  .object({ text: z.string(), start_time: z.number(), end_time: z.number() })
  .strict()
  .passthrough();
const SegmentDescribeSpeechEntry: z.ZodType<SegmentDescribeSpeechEntry> = z
  .object({
    text: z.string(),
    start_time: z.number(),
    end_time: z.number(),
    speaker: z.string().optional(),
  })
  .strict()
  .passthrough();
const SegmentDescribeJsonData: z.ZodType<SegmentDescribeJsonData> = z
  .object({
    visual_scene_description: z.array(SegmentDescribeOutputEntry),
    speech: z.array(SegmentDescribeSpeechEntry),
    scene_text: z.array(SegmentDescribeOutputEntry),
    audio_description: z.array(SegmentDescribeOutputEntry),
    title: z.string(),
    summary: z.string(),
    start_time: z.number(),
    end_time: z.number(),
    segment_id: z.string().uuid(),
  })
  .partial()
  .strict()
  .passthrough();
const DescribeConfig: z.ZodType<DescribeConfig> = z
  .object({
    enable_summary: z.boolean().default(true),
    enable_speech: z.boolean().default(true),
    enable_visual_scene_description: z.boolean().default(true),
    enable_scene_text: z.boolean().default(true),
    enable_audio_description: z.boolean().default(false),
  })
  .partial()
  .strict()
  .passthrough();
const SegmentDescribeMarkdownData: z.ZodType<SegmentDescribeMarkdownData> = z
  .object({ content: z.string() })
  .strict()
  .passthrough();
const SegmentDescribe: z.ZodType<SegmentDescribe> = z
  .object({
    job_id: z.string().uuid(),
    segment_id: z.string().uuid(),
    status: z.enum([
      'pending',
      'processing',
      'completed',
      'failed',
      'not_applicable',
    ]),
    describe_config: DescribeConfig,
    created_at: z.number().int(),
    completed_at: z.number().int().optional(),
    start_time: z.number(),
    end_time: z.number(),
    file_id: z.string().uuid(),
    segmentation_id: z.string().uuid().optional(),
    data: z
      .union([SegmentDescribeJsonData, SegmentDescribeMarkdownData])
      .optional(),
    object: z.literal('segment_describe'),
  })
  .strict()
  .passthrough();
const SegmentDescribeListResponse: z.ZodType<SegmentDescribeListResponse> = z
  .object({
    object: z.literal('list'),
    data: z.array(SegmentDescribe),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const SegmentationListItem: z.ZodType<SegmentationListItem> = z
  .object({
    segmentation_id: z.string().uuid(),
    status: z.enum([
      'pending',
      'processing',
      'completed',
      'failed',
      'not_applicable',
    ]),
    created_at: z.number().gte(0),
    file_id: z.string().uuid(),
    segmentation_config: SegmentationConfig,
    thumbnails_config: ThumbnailsConfig,
    total_segments: z.number().gte(0).optional(),
  })
  .strict()
  .passthrough();
const SegmentationList: z.ZodType<SegmentationList> = z
  .object({
    object: z.literal('list'),
    data: z.array(SegmentationListItem),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const FrameExtractionList: z.ZodType<FrameExtractionList> = z
  .object({
    object: z.literal('list'),
    data: z.array(
      z
        .object({
          frame_extraction_id: z.string().uuid(),
          status: z.enum(['pending', 'processing', 'completed', 'failed']),
          created_at: z.number().gte(0),
          file_id: z.string().uuid(),
          frame_extraction_config: FrameExtractionConfig,
          frame_count: z.number().gte(0).optional(),
        })
        .strict()
        .passthrough()
    ),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const FileSegment: z.ZodType<FileSegment> = z
  .object({
    id: z.string().uuid(),
    file_id: z.string().uuid(),
    start_time: z.number(),
    end_time: z.number(),
    thumbnail_url: z.string(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
    segmentation_id: z.string().uuid().optional(),
  })
  .strict()
  .passthrough();
const FileSegmentListResponse: z.ZodType<FileSegmentListResponse> = z
  .object({
    object: z.literal('list'),
    data: z.array(FileSegment),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const FileUpload = z
  .object({
    file: z.instanceof(File),
    metadata: z.object({}).partial().strict().passthrough().optional(),
    enable_segment_thumbnails: z.boolean().optional().default(false),
  })
  .strict()
  .passthrough();
const FileDelete = z
  .object({ id: z.string(), object: z.literal('file') })
  .strict()
  .passthrough();
const FileUpdate = z
  .object({
    metadata: z.object({}).partial().strict().passthrough(),
    filename: z.string(),
  })
  .partial()
  .strict()
  .passthrough();
const createFileSegmentation_Body = SegmentationConfig;
const createFileFrameExtraction_Body = FrameExtractionConfig;

export const schemas = {
  FileList,
  SegmentDescribeOutputEntry,
  SegmentDescribeSpeechEntry,
  SegmentDescribeJsonData,
  DescribeConfig,
  SegmentDescribeMarkdownData,
  SegmentDescribe,
  SegmentDescribeListResponse,
  SegmentationListItem,
  SegmentationList,
  FrameExtractionList,
  FileSegment,
  FileSegmentListResponse,
  FileUpload,
  FileDelete,
  FileUpdate,
  createFileSegmentation_Body,
  createFileFrameExtraction_Body,
};

const endpoints = makeApi([
  {
    method: 'post',
    path: '/files',
    alias: 'uploadFile',
    description: `Upload a video file that can be used with Cloudglue services`,
    requestFormat: 'form-data',
    parameters: [
      {
        name: 'body',
        description: `Upload a video file`,
        type: 'Body',
        schema: FileUpload,
      },
    ],
    response: CloudglueFile,
    errors: [
      {
        status: 400,
        description: `Invalid request, missing file, invalid metadata, or video duration exceeds limits`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 415,
        description: `Unsupported file type`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 429,
        description: `Resource limits exceeded (monthly upload limit, total duration, file size, or total files)`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/files',
    alias: 'listFiles',
    description: `List files that have been uploaded to Cloudglue`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'status',
        type: 'Query',
        schema: z
          .enum([
            'pending',
            'processing',
            'completed',
            'failed',
            'not_applicable',
          ])
          .optional(),
      },
      {
        name: 'created_before',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'created_after',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().lte(100).optional().default(50),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional().default(0),
      },
      {
        name: 'order',
        type: 'Query',
        schema: z
          .enum(['created_at', 'filename'])
          .optional()
          .default('created_at'),
      },
      {
        name: 'sort',
        type: 'Query',
        schema: z.enum(['asc', 'desc']).optional().default('desc'),
      },
      {
        name: 'filter',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: FileList,
    errors: [
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/files/:file_id',
    alias: 'getFile',
    description: `Retrieve details about a specific file`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: CloudglueFile,
    errors: [
      {
        status: 404,
        description: `File not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/files/:file_id',
    alias: 'deleteFile',
    description: `Delete a file`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: FileDelete,
    errors: [
      {
        status: 404,
        description: `File not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'put',
    path: '/files/:file_id',
    alias: 'updateFile',
    description: `Update a file`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `File update parameters`,
        type: 'Body',
        schema: FileUpdate,
      },
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: CloudglueFile,
    errors: [
      {
        status: 400,
        description: `Invalid request or malformed file update parameters`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'post',
    path: '/files/:file_id/segmentations',
    alias: 'createFileSegmentation',
    description: `Create a new segmentation for a file using the specified segmentation configuration`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Segmentation configuration`,
        type: 'Body',
        schema: createFileSegmentation_Body,
      },
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: Segmentation,
    errors: [
      {
        status: 400,
        description: `Invalid request or file duration is less than window size`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `File not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/files/:file_id/segmentations',
    alias: 'listFileSegmentations',
    description: `List all segmentations for a specific file`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(100).optional().default(50),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().gte(0).optional().default(0),
      },
    ],
    response: SegmentationList,
    errors: [
      {
        status: 404,
        description: `File not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/files/:file_id/thumbnails',
    alias: 'getThumbnails',
    description: `Get all thumbnails for a file`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'is_default',
        type: 'Query',
        schema: z.boolean().optional().default(false),
      },
      {
        name: 'segmentation_id',
        type: 'Query',
        schema: z.string().uuid().optional(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(100).optional().default(50),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().gte(0).optional().default(0),
      },
      {
        name: 'type',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: ThumbnailList,
    errors: [
      {
        status: 404,
        description: `File not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/files/:file_id/tags',
    alias: 'listFileTags',
    description: `List all tags for a specific file`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: ListVideoTagsResponse,
  },
  {
    method: 'get',
    path: '/files/:file_id/segments',
    alias: 'listFileSegments',
    description: `List all segments for a specific file`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'start_time_after',
        type: 'Query',
        schema: z.number().gte(0).optional(),
      },
      {
        name: 'end_time_before',
        type: 'Query',
        schema: z.number().gte(0).optional(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(100).optional().default(50),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().gte(0).optional().default(0),
      },
    ],
    response: FileSegmentListResponse,
  },
  {
    method: 'get',
    path: '/files/:file_id/segments/:segment_id',
    alias: 'getFileSegment',
    description: `Get a file segment`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'segment_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: FileSegment,
    errors: [
      {
        status: 404,
        description: `File segment not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'put',
    path: '/files/:file_id/segments/:segment_id',
    alias: 'updateFileSegment',
    description: `Update a file segment`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `File segment update parameters`,
        type: 'Body',
        schema: z
          .object({ metadata: z.object({}).partial().strict().passthrough() })
          .partial()
          .strict()
          .passthrough(),
      },
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'segment_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: FileSegment,
    errors: [
      {
        status: 400,
        description: `Invalid request or malformed file segment update parameters`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `File segment not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/files/:file_id/segments/:segment_id/tags',
    alias: 'listFileSegmentTags',
    description: `List all tags for a specific file segment`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'segment_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: ListVideoTagsResponse,
  },
  {
    method: 'get',
    path: '/files/:file_id/segments/:segment_id/describes',
    alias: 'listFileSegmentDescribes',
    description: `List all describe outputs for a specific file segment`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'segment_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'status',
        type: 'Query',
        schema: z.string().optional().default('completed'),
      },
      {
        name: 'response_format',
        type: 'Query',
        schema: z.enum(['json', 'markdown']).optional().default('json'),
      },
      {
        name: 'include_data',
        type: 'Query',
        schema: z.boolean().optional().default(false),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(100).optional().default(50),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().gte(0).optional().default(0),
      },
    ],
    response: SegmentDescribeListResponse,
    errors: [
      {
        status: 404,
        description: `File or segment not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/files/:file_id/segments/:segment_id/describes/:job_id',
    alias: 'getFileSegmentDescribe',
    description: `Get a specific describe output for a file segment by job ID`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'segment_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'job_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'response_format',
        type: 'Query',
        schema: z.enum(['json', 'markdown']).optional().default('json'),
      },
    ],
    response: SegmentDescribe,
    errors: [
      {
        status: 404,
        description: `CloudglueFile, segment, or describe job not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'post',
    path: '/files/:file_id/frames',
    alias: 'createFileFrameExtraction',
    description: `Create a new frame extraction for a file using the specified frame extraction configuration. This is an async operation that returns immediately with a &#x27;pending&#x27; status. Results are cached, so identical requests will return the same frame extraction.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Frame extraction configuration`,
        type: 'Body',
        schema: createFileFrameExtraction_Body,
      },
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: FrameExtraction,
    errors: [
      {
        status: 400,
        description: `Invalid request or file duration is less than specified time range`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `File not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/files/:file_id/frames',
    alias: 'listFileFrameExtractions',
    description: `List all frame extractions for a specific file`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(100).optional().default(50),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().gte(0).optional().default(0),
      },
    ],
    response: FrameExtractionList,
    errors: [
      {
        status: 404,
        description: `File not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
]);

export const FilesApi = new Zodios('https://api.cloudglue.dev/v1', endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
