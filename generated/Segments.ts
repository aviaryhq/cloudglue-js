import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

type Segments = {
  job_id: string;
  file_id: string;
  object: "segments";
  status: "pending" | "processing" | "completed" | "failed";
  criteria: "shot" | "narrative";
  created_at: number;
  shot_config?: ShotConfig | undefined;
  narrative_config?: NarrativeConfig | undefined;
  total_segments?: number | undefined;
  segments?: Array<Segment> | undefined;
};
type NewSegments = {
  url: string;
  criteria: "shot" | "narrative";
  shot_config?: ShotConfig | undefined;
  narrative_config?: NarrativeConfig | undefined;
};
type ShotConfig = Partial<{
  detector: "content" | "adaptive";
  max_duration_seconds: number;
  min_duration_seconds: number;
}>;
type NarrativeConfig = Partial<{
  prompt: string;
}>;
type Segment = {
  start_time: number;
  end_time: number;
  description?: string | undefined;
  thumbnail_url?: string | undefined;
};
type SegmentsList = {
  object: "list";
  data: Array<SegmentsListItem>;
  total: number;
  limit: number;
  offset: number;
};
type SegmentsListItem = {
  job_id: string;
  file_id: string;
  object: "segments";
  status: "pending" | "processing" | "completed" | "failed";
  criteria: "shot" | "narrative";
  created_at: number;
  shot_config?: ShotConfig | undefined;
  narrative_config?: NarrativeConfig | undefined;
};

const ShotConfig: z.ZodType<ShotConfig> = z
  .object({
    detector: z.enum(["content", "adaptive"]).default("adaptive"),
    max_duration_seconds: z.number().int().gte(1).lte(3600).default(300),
    min_duration_seconds: z.number().int().gte(1).lte(3600).default(1),
  })
  .partial()
  .strict()
  .passthrough();
const NarrativeConfig: z.ZodType<NarrativeConfig> = z
  .object({ prompt: z.string() })
  .partial()
  .strict()
  .passthrough();
const NewSegments: z.ZodType<NewSegments> = z
  .object({
    url: z.string(),
    criteria: z.enum(["shot", "narrative"]),
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
  })
  .strict()
  .passthrough();
const Segments: z.ZodType<Segments> = z
  .object({
    job_id: z.string().uuid(),
    file_id: z.string().uuid(),
    object: z.literal("segments"),
    status: z.enum(["pending", "processing", "completed", "failed"]),
    criteria: z.enum(["shot", "narrative"]),
    created_at: z.number().int(),
    shot_config: ShotConfig.optional(),
    narrative_config: NarrativeConfig.optional(),
    total_segments: z.number().int().gte(0).optional(),
    segments: z.array(Segment).optional(),
  })
  .strict()
  .passthrough();
const SegmentsListItem: z.ZodType<SegmentsListItem> = z
  .object({
    job_id: z.string().uuid(),
    file_id: z.string().uuid(),
    object: z.literal("segments"),
    status: z.enum(["pending", "processing", "completed", "failed"]),
    criteria: z.enum(["shot", "narrative"]),
    created_at: z.number().int(),
    shot_config: ShotConfig.optional(),
    narrative_config: NarrativeConfig.optional(),
  })
  .strict()
  .passthrough();
const SegmentsList: z.ZodType<SegmentsList> = z
  .object({
    object: z.literal("list"),
    data: z.array(SegmentsListItem),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();

export const schemas = {
  ShotConfig,
  NarrativeConfig,
  NewSegments,
  Segment,
  Segments,
  SegmentsListItem,
  SegmentsList,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/segments",
    alias: "createSegments",
    description: `Create intelligent video segments based on shot detection or narrative analysis.

**⚠️ Note: YouTube URLs are supported for narrative-based segmentation only.** Shot-based segmentation requires direct video file access. Use Cloudglue Files, HTTP URLs, or files from data connectors for shot-based segmentation.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Segmentation job parameters`,
        type: "Body",
        schema: NewSegments,
      },
    ],
    response: Segments,
    errors: [
      {
        status: 400,
        description: `Invalid request, missing required parameters, or unsupported URL type (e.g., YouTube URLs with shot-based segmentation are not supported)`,
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
    method: "get",
    path: "/segments",
    alias: "listSegments",
    description: `List all segmentation jobs with optional filtering`,
    requestFormat: "json",
    parameters: [
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().lte(100).optional().default(50),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().optional().default(0),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .enum(["pending", "processing", "completed", "failed"])
          .optional(),
      },
      {
        name: "criteria",
        type: "Query",
        schema: z.enum(["shot", "narrative"]).optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "url",
        type: "Query",
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
    method: "get",
    path: "/segments/:job_id",
    alias: "getSegments",
    description: `Retrieve the current state of a segmentation job`,
    requestFormat: "json",
    parameters: [
      {
        name: "job_id",
        type: "Path",
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
    method: "delete",
    path: "/segments/:job_id",
    alias: "deleteSegments",
    description: `Delete a specific segments job`,
    requestFormat: "json",
    parameters: [
      {
        name: "job_id",
        type: "Path",
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
  "https://api.cloudglue.dev/v1",
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
