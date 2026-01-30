import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

import { NarrativeConfig } from './common';
import { Shot } from './common';
import { Chapter } from './common';

type Segments = {
  job_id: string;
  file_id: string;
  object: 'segments';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  criteria: 'shot' | 'narrative';
  created_at: number;
  shot_config?: ShotConfig | undefined;
  narrative_config?: NarrativeConfig | undefined;
  total_segments?: number | undefined;
  total_shots?: number | undefined;
  total_chapters?: number | undefined;
  segments?: Array<Segment> | undefined;
  shots?: Array<Shot> | undefined;
  chapters?: Array<Chapter> | undefined;
};
type NewSegments = {
  url: string;
  criteria: 'shot' | 'narrative';
  shot_config?: ShotConfig | undefined;
  narrative_config?: NarrativeConfig | undefined;
};
type ShotConfig = Partial<{
  detector: 'content' | 'adaptive';
  max_duration_seconds: number;
  min_duration_seconds: number;
}>;
type Segment = {
  start_time: number;
  end_time: number;
  description?: string | undefined;
  thumbnail_url?: string | undefined;
  shot_index?: number | undefined;
};
type SegmentsList = {
  object: 'list';
  data: Array<SegmentsListItem>;
  total: number;
  limit: number;
  offset: number;
};
type SegmentsListItem = {
  job_id: string;
  file_id: string;
  object: 'segments';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  criteria: 'shot' | 'narrative';
  created_at: number;
  shot_config?: ShotConfig | undefined;
  narrative_config?: NarrativeConfig | undefined;
};

const ShotConfig: z.ZodType<ShotConfig> = z
  .object({
    detector: z.enum(['content', 'adaptive']).default('adaptive'),
    max_duration_seconds: z.number().int().gte(1).lte(3600).default(300),
    min_duration_seconds: z.number().int().gte(1).lte(3600).default(1),
  })
  .partial()
  .strict()
  .passthrough();
const NewSegments: z.ZodType<NewSegments> = z
  .object({
    url: z.string(),
    criteria: z.enum(['shot', 'narrative']),
    shot_config: ShotConfig.optional(),
    narrative_config: NarrativeConfig.optional(),
  })
  .strict()
  .passthrough();
const Segment: z.ZodType<Segment> = z
  .object({
    start_time: z.number().gte(0),
    end_time: z.number().gte(0),
    description: z.string().optional(),
    thumbnail_url: z.string().url().optional(),
    shot_index: z.number().int().optional(),
  })
  .strict()
  .passthrough();
const Segments: z.ZodType<Segments> = z
  .object({
    job_id: z.string().uuid(),
    file_id: z.string().uuid(),
    object: z.literal('segments'),
    status: z.enum(['pending', 'processing', 'completed', 'failed']),
    criteria: z.enum(['shot', 'narrative']),
    created_at: z.number().int(),
    shot_config: ShotConfig.optional(),
    narrative_config: NarrativeConfig.optional(),
    total_segments: z.number().int().gte(0).optional(),
    total_shots: z.number().int().gte(0).optional(),
    total_chapters: z.number().int().gte(0).optional(),
    segments: z.array(Segment).optional(),
    shots: z.array(Shot).optional(),
    chapters: z.array(Chapter).optional(),
  })
  .strict()
  .passthrough();
const SegmentsListItem: z.ZodType<SegmentsListItem> = z
  .object({
    job_id: z.string().uuid(),
    file_id: z.string().uuid(),
    object: z.literal('segments'),
    status: z.enum(['pending', 'processing', 'completed', 'failed']),
    criteria: z.enum(['shot', 'narrative']),
    created_at: z.number().int(),
    shot_config: ShotConfig.optional(),
    narrative_config: NarrativeConfig.optional(),
  })
  .strict()
  .passthrough();
const SegmentsList: z.ZodType<SegmentsList> = z
  .object({
    object: z.literal('list'),
    data: z.array(SegmentsListItem),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();

export const schemas = {
  ShotConfig,
  NewSegments,
  Segment,
  Segments,
  SegmentsListItem,
  SegmentsList,
};

const endpoints = makeApi([
  {
    method: 'post',
    path: '/segments',
    alias: 'createSegments',
    description: `Create intelligent segments for video or audio files based on shot detection or narrative analysis.

**Audio File Support:**

- Audio files support **narrative** criteria only (shot detection is not available for audio).
- Audio files automatically use the &#x27;balanced&#x27; strategy.

**Note: YouTube URLs and audio files are supported for narrative-based segmentation only.** Shot-based segmentation requires direct video file access. Use Cloudglue Files, HTTP URLs, or files from data connectors for shot-based segmentation.

**Narrative Segmentation Strategies:**

- **comprehensive** (default for non-YouTube/non-audio files): Uses a VLM to deeply analyze logical segments of video. Only available for video files (not YouTube or audio).
- **balanced** (default for YouTube videos and audio files): Balanced analysis approach using multiple modalities. Supports YouTube URLs and audio files.

**YouTube URLs and Audio Files**: Automatically use the &#x27;balanced&#x27; strategy. The strategy field is ignored, and other strategies will be rejected with an error.

**Chapter Count Parameters:**

- **number_of_chapters**: Target number of chapters. If only this is provided, min_chapters and max_chapters are calculated automatically.
- **min_chapters**: Minimum number of chapters. If provided with number_of_chapters and max, validates min is less than or equal to number_of_chapters which is less than or equal to max.
- **max_chapters**: Maximum number of chapters. If provided with number_of_chapters and min, validates min is less than or equal to number_of_chapters which is less than or equal to max.
- If none are provided, chapter counts are calculated automatically based on file duration.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Segmentation job parameters`,
        type: 'Body',
        schema: NewSegments,
      },
    ],
    response: Segments,
    errors: [
      {
        status: 400,
        description: `Invalid request, missing required parameters, unsupported URL type (e.g., YouTube URLs with shot-based segmentation), or unsupported strategy for YouTube URLs (YouTube URLs only support &#x27;balanced&#x27; strategy)`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `File not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 429,
        description: `Monthly segments jobs limit reached`,
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
    path: '/segments',
    alias: 'listSegments',
    description: `List all segmentation jobs with optional filtering`,
    requestFormat: 'json',
    parameters: [
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
        name: 'status',
        type: 'Query',
        schema: z
          .enum(['pending', 'processing', 'completed', 'failed'])
          .optional(),
      },
      {
        name: 'criteria',
        type: 'Query',
        schema: z.enum(['shot', 'narrative']).optional(),
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
        name: 'url',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: SegmentsList,
    errors: [
      {
        status: 400,
        description: `Invalid request parameters`,
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
    path: '/segments/:job_id',
    alias: 'getSegments',
    description: `Retrieve the current state of a segmentation job`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'job_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: Segments,
    errors: [
      {
        status: 404,
        description: `Job not found`,
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
    path: '/segments/:job_id',
    alias: 'deleteSegments',
    description: `Delete a specific segments job`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'job_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: z.object({ id: z.string().uuid() }).strict().passthrough(),
    errors: [
      {
        status: 404,
        description: `Segments job not found`,
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

export const SegmentsApi = new Zodios(
  'https://api.cloudglue.dev/v1',
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
