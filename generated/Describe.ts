import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { ThumbnailsConfig } from "./common";
import { FileSegmentationConfig } from "./common";
import { SegmentationConfig } from "./common";
import { SegmentationUniformConfig } from "./common";
import { SegmentationShotDetectorConfig } from "./common";

type Describe = {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed" | "not_applicable";
  url?: string | undefined;
  created_at?: number | undefined;
  describe_config?:
    | Partial<{
        enable_summary: boolean;
        enable_speech: boolean;
        enable_visual_scene_description: boolean;
        enable_scene_text: boolean;
      }>
    | undefined;
  data?:
    | Partial<{
        content: string;
        title: string;
        summary: string;
        speech: Array<
          Partial<{
            speaker: string;
            text: string;
            start_time: number;
            end_time: number;
          }>
        >;
        visual_scene_description: Array<
          Partial<{
            text: string;
            start_time: number;
            end_time: number;
          }>
        >;
        scene_text: Array<
          Partial<{
            text: string;
            start_time: number;
            end_time: number;
          }>
        >;
        segment_summary: Array<
          Partial<{
            title: string;
            summary: string;
            start_time: number;
            end_time: number;
          }>
        >;
      }>
    | undefined;
  error?: string | undefined;
};
type NewDescribe = {
  url: string;
  enable_summary?: boolean | undefined;
  enable_speech?: boolean | undefined;
  enable_visual_scene_description?: boolean | undefined;
  enable_scene_text?: boolean | undefined;
  thumbnails_config?: ThumbnailsConfig | undefined;
} & FileSegmentationConfig;
type DescribeList = {
  object: "list";
  data: Array<Describe>;
  total: number;
  limit: number;
};

const NewDescribe: z.ZodType<NewDescribe> = z
  .object({
    url: z.string(),
    enable_summary: z.boolean().optional().default(true),
    enable_speech: z.boolean().optional().default(true),
    enable_visual_scene_description: z.boolean().optional().default(true),
    enable_scene_text: z.boolean().optional().default(true),
    thumbnails_config: ThumbnailsConfig.optional(),
  })
  .strict()
  .passthrough()
  .and(FileSegmentationConfig);
const Describe: z.ZodType<Describe> = z
  .object({
    job_id: z.string(),
    status: z.enum([
      "pending",
      "processing",
      "completed",
      "failed",
      "not_applicable",
    ]),
    url: z.string().optional(),
    created_at: z.number().int().optional(),
    describe_config: z
      .object({
        enable_summary: z.boolean(),
        enable_speech: z.boolean(),
        enable_visual_scene_description: z.boolean(),
        enable_scene_text: z.boolean(),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    data: z
      .object({
        content: z.string(),
        title: z.string(),
        summary: z.string(),
        speech: z.array(
          z
            .object({
              speaker: z.string(),
              text: z.string(),
              start_time: z.number(),
              end_time: z.number(),
            })
            .partial()
            .strict()
            .passthrough()
        ),
        visual_scene_description: z.array(
          z
            .object({
              text: z.string(),
              start_time: z.number(),
              end_time: z.number(),
            })
            .partial()
            .strict()
            .passthrough()
        ),
        scene_text: z.array(
          z
            .object({
              text: z.string(),
              start_time: z.number(),
              end_time: z.number(),
            })
            .partial()
            .strict()
            .passthrough()
        ),
        segment_summary: z.array(
          z
            .object({
              title: z.string(),
              summary: z.string(),
              start_time: z.number(),
              end_time: z.number(),
            })
            .partial()
            .strict()
            .passthrough()
        ),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    error: z.string().optional(),
  })
  .strict()
  .passthrough();
const DescribeList: z.ZodType<DescribeList> = z
  .object({
    object: z.literal("list"),
    data: z.array(Describe),
    total: z.number().int(),
    limit: z.number().int(),
  })
  .strict()
  .passthrough();

export const schemas = {
  NewDescribe,
  Describe,
  DescribeList,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/describe",
    alias: "createDescribe",
    description: `Get a comprehensive multimodal description of a video`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Media description job parameters`,
        type: "Body",
        schema: NewDescribe,
      },
    ],
    response: Describe,
    errors: [
      {
        status: 400,
        description: `Invalid request or missing required url/file_id`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `File not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 429,
        description: `Chat completion limits reached (monthly or daily)`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 509,
        description: `Monthly description jobs limit reached`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/describe",
    alias: "listDescribes",
    description: `List all media description jobs with optional filtering`,
    requestFormat: "json",
    parameters: [
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().lte(100).optional().default(20),
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
          .enum([
            "pending",
            "processing",
            "completed",
            "failed",
            "not_applicable",
          ])
          .optional(),
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
      {
        name: "response_format",
        type: "Query",
        schema: z.enum(["json", "markdown"]).optional().default("json"),
      },
    ],
    response: DescribeList,
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
    path: "/describe/:job_id",
    alias: "getDescribe",
    description: `Retrieve the current state of a media description job`,
    requestFormat: "json",
    parameters: [
      {
        name: "job_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "response_format",
        type: "Query",
        schema: z.enum(["json", "markdown"]).optional().default("json"),
      },
    ],
    response: Describe,
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
]);

export const DescribeApi = new Zodios(
  "https://api.cloudglue.dev/v1",
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
