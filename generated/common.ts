import { z } from 'zod';

export type DescribeOutput = Partial<{
  visual_scene_description: Array<DescribeOutputPart>;
  scene_text: Array<DescribeOutputPart>;
  speech: Array<SpeechOutputPart>;
  audio_description: Array<DescribeOutputPart>;
}>;
export type DescribeOutputPart = Partial<{
  text: string;
  start_time: number;
  end_time: number;
}>;
export type SpeechOutputPart = Partial<{
  speaker: string;
  text: string;
  start_time: number;
  end_time: number;
}>;
export type ThumbnailsConfig = {
  enable_segment_thumbnails: boolean;
};
export type FileSegmentationConfig = Partial<{
  segmentation_id: string;
  segmentation_config: SegmentationConfig;
}>;
export type SegmentationConfig = {
  strategy: 'uniform' | 'shot-detector' | 'manual';
  uniform_config?: SegmentationUniformConfig | undefined;
  shot_detector_config?: SegmentationShotDetectorConfig | undefined;
  manual_config?: SegmentationManualConfig | undefined;
  keyframe_config?: KeyframeConfig | undefined;
  start_time_seconds?: number | undefined;
  end_time_seconds?: number | undefined;
};
export type SegmentationUniformConfig = {
  window_seconds: number;
  hop_seconds?: number | undefined;
};
export type SegmentationShotDetectorConfig = {
  threshold?: (number | null) | undefined;
  min_seconds?: (number | null) | undefined;
  max_seconds?: (number | null) | undefined;
  detector: 'adaptive' | 'content';
};
export type SegmentationManualConfig = {
  segments: Array<
    Partial<{
      start_time: number;
      end_time: number;
    }>
  >;
};
export type KeyframeConfig = {
  frames_per_segment: number;
  max_width?: number | undefined;
};
export type File = {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable';
  bytes?: (number | null) | undefined;
  created_at?: number | undefined;
  filename?: string | undefined;
  uri: string;
  metadata?: ({} | null) | undefined;
  video_info?:
    | Partial<{
        duration_seconds: number | null;
        height: number | null;
        width: number | null;
        format: string | null;
        has_audio: boolean | null;
      }>
    | undefined;
  thumbnail_url?: string | undefined;
  source?:
    | (
        | 'video'
        | 'youtube'
        | 's3'
        | 'dropbox'
        | 'http'
        | 'upload'
        | 'google-drive'
        | 'zoom'
        | 'gong'
        | 'recall'
      )
    | undefined;
};
export type SearchFilter = Partial<{
  metadata: Array<
    SearchFilterCriteria &
      Partial<{
        scope: 'file' | 'segment';
      }>
  >;
  video_info: Array<
    SearchFilterCriteria &
      Partial<{
        path: 'duration_seconds' | 'has_audio';
      }>
  >;
  file: Array<
    SearchFilterCriteria &
      Partial<{
        path: 'bytes' | 'filename' | 'uri' | 'created_at' | 'id';
      }>
  >;
}>;
export type SearchFilterCriteria = {
  path: string;
  operator:
    | 'NotEqual'
    | 'Equal'
    | 'LessThan'
    | 'GreaterThan'
    | 'ContainsAny'
    | 'ContainsAll'
    | 'In'
    | 'Like';
  valueText?: string | undefined;
  valueTextArray?: Array<string> | undefined;
};
export type Segmentation = {
  segmentation_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable';
  created_at: number;
  file_id: string;
  segmentation_config: SegmentationConfig;
  thumbnails_config: ThumbnailsConfig;
  total_segments?: number | undefined;
  total_shots?: number | undefined;
  data?:
    | {
        object: 'list';
        segments?:
          | Array<{
              id: string;
              start_time: number;
              end_time: number;
              thumbnail_url?: string | undefined;
            }>
          | undefined;
        shots?: Array<Shot> | undefined;
        total: number;
        limit: number;
        offset: number;
      }
    | undefined;
};
export type Shot = {
  index: number;
  start_time: number;
  end_time: number;
};
export type FrameExtractionConfig = {
  strategy: 'uniform';
  uniform_config?: FrameExtractionUniformConfig | undefined;
  thumbnails_config?: FrameExtractionThumbnailsConfig | undefined;
  start_time_seconds?: number | undefined;
  end_time_seconds?: number | undefined;
};
export type FrameExtractionUniformConfig = Partial<{
  frames_per_second: number;
  max_width: number;
}>;
export type FrameExtractionThumbnailsConfig = Partial<{
  enable_frame_thumbnails: boolean;
}>;
export type FrameExtraction = {
  frame_extraction_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: number;
  file_id: string;
  frame_extraction_config: FrameExtractionConfig;
  frame_count?: number | undefined;
  data?:
    | {
        object: 'list';
        frames?:
          | Array<{
              id: string;
              timestamp: number;
              thumbnail_url?: string | undefined;
            }>
          | undefined;
        total: number;
        limit: number;
        offset: number;
      }
    | undefined;
};
export type ThumbnailList = {
  object: 'list';
  total: number;
  limit: number;
  offset: number;
  data: Array<Thumbnail>;
};
export type Thumbnail = {
  id: string;
  url: string;
  time: number;
  segmentation_id?: string | undefined;
  type?: ThumbnailType | undefined;
  segment_id?: string | undefined;
};
export type ThumbnailType = string;
export type FaceBoundingBox = {
  height: number;
  width: number;
  top: number;
  left: number;
};
export type ListVideoTagsResponse = PaginationResponse &
  Partial<{
    data: Array<VideoTag>;
  }>;
export type PaginationResponse = {
  object: 'list';
  total: number;
  limit: number;
  offset: number;
};
export type VideoTag = {
  id: string;
  label: string;
  value: string;
  type: 'file' | 'segment';
  file_id: string;
  segment_id?: string | undefined;
};

export const VideoTag = z
  .object({
    id: z.string().uuid(),
    label: z.string(),
    value: z.string(),
    type: z.enum(['file', 'segment']),
    file_id: z.string().uuid(),
    segment_id: z.string().uuid().optional(),
  })
  .strict()
  .passthrough();
export const PaginationResponse = z
  .object({
    object: z.literal('list'),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
export const ListVideoTagsResponse = PaginationResponse.and(
  z
    .object({ data: z.array(VideoTag) })
    .partial()
    .strict()
    .passthrough()
);
export const ThumbnailsConfig = z
  .object({ enable_segment_thumbnails: z.boolean() })
  .strict()
  .passthrough();
export const SegmentationUniformConfig = z
  .object({
    window_seconds: z.number().gte(1).lte(120),
    hop_seconds: z.number().gte(1).lte(120).optional(),
  })
  .strict()
  .passthrough();
export const SegmentationShotDetectorConfig = z
  .object({
    threshold: z.number().nullish(),
    min_seconds: z.number().gte(1).lte(120).nullish(),
    max_seconds: z.number().gte(1).lte(120).nullish(),
    detector: z.enum(['adaptive', 'content']),
  })
  .strict()
  .passthrough();
export const SegmentationManualConfig = z
  .object({
    segments: z.array(
      z
        .object({ start_time: z.number(), end_time: z.number() })
        .partial()
        .strict()
        .passthrough()
    ),
  })
  .strict()
  .passthrough();
export const KeyframeConfig = z
  .object({
    frames_per_segment: z.number().gte(0).lte(8),
    max_width: z.number().gte(144).lte(4320).optional().default(280),
  })
  .strict()
  .passthrough();
export const SegmentationConfig = z
  .object({
    strategy: z.enum(['uniform', 'shot-detector', 'manual']),
    uniform_config: SegmentationUniformConfig.optional(),
    shot_detector_config: SegmentationShotDetectorConfig.optional(),
    manual_config: SegmentationManualConfig.optional(),
    keyframe_config: KeyframeConfig.optional(),
    start_time_seconds: z.number().gte(0).optional(),
    end_time_seconds: z.number().gte(0).optional(),
  })
  .strict()
  .passthrough();
export const FileSegmentationConfig = z
  .object({
    segmentation_id: z.string().uuid(),
    segmentation_config: SegmentationConfig,
  })
  .partial()
  .strict()
  .passthrough();
export const File = z
  .object({
    id: z.string(),
    status: z.enum([
      'pending',
      'processing',
      'completed',
      'failed',
      'not_applicable',
    ]),
    bytes: z.number().int().nullish(),
    created_at: z.number().int().optional(),
    filename: z.string().optional(),
    uri: z.string(),
    metadata: z.object({}).partial().strict().passthrough().nullish(),
    video_info: z
      .object({
        duration_seconds: z.number().nullable(),
        height: z.number().int().nullable(),
        width: z.number().int().nullable(),
        format: z.string().nullable(),
        has_audio: z.boolean().nullable(),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    thumbnail_url: z.string().optional(),
    source: z
      .enum([
        'video',
        'youtube',
        's3',
        'dropbox',
        'http',
        'upload',
        'google-drive',
        'zoom',
        'gong',
        'recall',
      ])
      .optional(),
  })
  .strict()
  .passthrough();
export const Shot = z
  .object({
    index: z.number().int(),
    start_time: z.number().gte(0),
    end_time: z.number().gte(0),
  })
  .strict()
  .passthrough();
export const Segmentation = z
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
    total_shots: z.number().gte(0).optional(),
    data: z
      .object({
        object: z.literal('list'),
        segments: z
          .array(
            z
              .object({
                id: z.string().uuid(),
                start_time: z.number(),
                end_time: z.number(),
                thumbnail_url: z.string().optional(),
              })
              .strict()
              .passthrough()
          )
          .optional(),
        shots: z.array(Shot).optional(),
        total: z.number().int(),
        limit: z.number().int(),
        offset: z.number().int(),
      })
      .strict()
      .passthrough()
      .optional(),
  })
  .strict()
  .passthrough();
export const ThumbnailType = z.string();
export const Thumbnail = z
  .object({
    id: z.string().uuid(),
    url: z.string(),
    time: z.number(),
    segmentation_id: z.string().uuid().optional(),
    type: ThumbnailType.optional(),
    segment_id: z.string().uuid().optional(),
  })
  .strict()
  .passthrough();
export const ThumbnailList = z
  .object({
    object: z.literal('list'),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
    data: z.array(Thumbnail),
  })
  .strict()
  .passthrough();
export const DescribeOutputPart = z
  .object({ text: z.string(), start_time: z.number(), end_time: z.number() })
  .partial()
  .strict()
  .passthrough();
export const SpeechOutputPart = z
  .object({
    speaker: z.string(),
    text: z.string(),
    start_time: z.number(),
    end_time: z.number(),
  })
  .partial()
  .strict()
  .passthrough();
export const DescribeOutput = z
  .object({
    visual_scene_description: z.array(DescribeOutputPart),
    scene_text: z.array(DescribeOutputPart),
    speech: z.array(SpeechOutputPart),
    audio_description: z.array(DescribeOutputPart),
  })
  .partial()
  .strict()
  .passthrough();
export const SearchFilterCriteria = z
  .object({
    path: z.string(),
    operator: z.enum([
      'NotEqual',
      'Equal',
      'LessThan',
      'GreaterThan',
      'ContainsAny',
      'ContainsAll',
      'In',
      'Like',
    ]),
    valueText: z.string().optional(),
    valueTextArray: z.array(z.string()).optional(),
  })
  .strict()
  .passthrough();
export const SearchFilter = z
  .object({
    metadata: z.array(
      SearchFilterCriteria.and(
        z
          .object({ scope: z.enum(['file', 'segment']).default('file') })
          .partial()
          .strict()
          .passthrough()
      )
    ),
    video_info: z.array(
      SearchFilterCriteria.and(
        z
          .object({ path: z.enum(['duration_seconds', 'has_audio']) })
          .partial()
          .strict()
          .passthrough()
      )
    ),
    file: z.array(
      SearchFilterCriteria.and(
        z
          .object({
            path: z.enum(['bytes', 'filename', 'uri', 'created_at', 'id']),
          })
          .partial()
          .strict()
          .passthrough()
      )
    ),
  })
  .partial()
  .strict()
  .passthrough();
export const FrameExtractionUniformConfig = z
  .object({
    frames_per_second: z.number().gte(0.1).lte(30).default(1),
    max_width: z.number().gte(64).lte(4096).default(1024),
  })
  .partial()
  .strict()
  .passthrough();
export const FrameExtractionThumbnailsConfig = z
  .object({ enable_frame_thumbnails: z.boolean().default(true) })
  .partial()
  .strict()
  .passthrough();
export const FrameExtractionConfig = z
  .object({
    strategy: z.literal('uniform'),
    uniform_config: FrameExtractionUniformConfig.optional(),
    thumbnails_config: FrameExtractionThumbnailsConfig.optional(),
    start_time_seconds: z.number().gte(0).optional(),
    end_time_seconds: z.number().gte(0).optional(),
  })
  .strict()
  .passthrough();
export const FrameExtraction = z
  .object({
    frame_extraction_id: z.string().uuid(),
    status: z.enum(['pending', 'processing', 'completed', 'failed']),
    created_at: z.number().gte(0),
    file_id: z.string().uuid(),
    frame_extraction_config: FrameExtractionConfig,
    frame_count: z.number().gte(0).optional(),
    data: z
      .object({
        object: z.literal('list'),
        frames: z
          .array(
            z
              .object({
                id: z.string().uuid(),
                timestamp: z.number(),
                thumbnail_url: z.string().optional(),
              })
              .strict()
              .passthrough()
          )
          .optional(),
        total: z.number().int(),
        limit: z.number().int(),
        offset: z.number().int(),
      })
      .strict()
      .passthrough()
      .optional(),
  })
  .strict()
  .passthrough();
export const FaceBoundingBox = z
  .object({
    height: z.number().gte(0).lte(1),
    width: z.number().gte(0).lte(1),
    top: z.number().gte(0).lte(1),
    left: z.number().gte(0).lte(1),
  })
  .strict()
  .passthrough();
