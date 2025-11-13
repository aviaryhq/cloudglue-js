import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { DescribeOutput } from "./common";
import { DescribeOutputPart } from "./common";
import { SpeechOutputPart } from "./common";
import { ThumbnailsConfig } from "./common";
import { FileSegmentationConfig } from "./common";
import { SegmentationConfig } from "./common";
import { SegmentationUniformConfig } from "./common";
import { SegmentationShotDetectorConfig } from "./common";
import { SegmentationManualConfig } from "./common";

type Transcribe = {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed" | "not_applicable";
  url?: string | undefined;
  created_at?: number | undefined;
  transcribe_config?:
    | Partial<{
        enable_summary: boolean;
        enable_speech: boolean;
        enable_visual_scene_description: boolean;
        enable_scene_text: boolean;
      }>
    | undefined;
  data?:
    | (Partial<{
        content: string;
        title: string;
        summary: string;
        segment_summary: Array<
          Partial<{
            title: string;
            summary: string;
            start_time: number;
            end_time: number;
          }>
        >;
      }> &
        DescribeOutput)
    | undefined;
  error?: string | undefined;
};
type NewTranscribe = {
  url: string;
  enable_summary?: boolean | undefined;
  enable_speech?: boolean | undefined;
  enable_visual_scene_description?: boolean | undefined;
  enable_scene_text?: boolean | undefined;
  enable_audio_description?: boolean | undefined;
  thumbnails_config?: ThumbnailsConfig | undefined;
} & FileSegmentationConfig;
type TranscribeList = {
  object: "list";
  data: Array<Transcribe>;
  total: number;
  limit: number;
};

const Transcribe: z.ZodType<Transcribe> = z
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
    transcribe_config: z
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
      .and(DescribeOutput)
      .optional(),
    error: z.string().optional(),
  })
  .strict()
  .passthrough();
const NewTranscribe: z.ZodType<NewTranscribe> = z
  .object({
    url: z.string(),
    enable_summary: z.boolean().optional().default(true),
    enable_speech: z.boolean().optional().default(true),
    enable_visual_scene_description: z.boolean().optional().default(false),
    enable_scene_text: z.boolean().optional().default(false),
    enable_audio_description: z.boolean().optional().default(false),
    thumbnails_config: ThumbnailsConfig.optional(),
  })
  .strict()
  .passthrough()
  .and(FileSegmentationConfig);
const TranscribeList: z.ZodType<TranscribeList> = z
  .object({
    object: z.literal("list"),
    data: z.array(Transcribe),
    total: z.number().int(),
    limit: z.number().int(),
  })
  .strict()
  .passthrough();

export const schemas = {
  Transcribe,
  NewTranscribe,
  TranscribeList,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/transcribe",
    alias: "createTranscribe",
    description: `Creates a new transcription job for video content.

Note: For most use cases, you should use the &#x60;/describe&#x60; endpoint instead. This API will be deprecated in the future and only supports speech level understanding.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Transcription job parameters`,
        type: "Body",
        schema: NewTranscribe,
      },
    ],
    response: Transcribe,
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
        description: `Monthly transcription jobs limit reached`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/transcribe",
    alias: "listTranscribes",
    description: `List all transcription jobs with optional filtering`,
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
    response: TranscribeList,
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
    path: "/transcribe/:job_id",
    alias: "getTranscribe",
    description: `Retrieve the current state of a transcription job`,
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
    response: Transcribe,
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

export const TranscribeApi = new Zodios(
  "https://api.cloudglue.dev/v1",
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
