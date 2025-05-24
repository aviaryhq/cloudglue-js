import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

type Extract = {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed" | "not_applicable";
  url?: string | undefined;
  created_at?: number | undefined;
  extract_config?:
    | Partial<{
        prompt: string;
        schema: {};
        enable_video_level_entities: boolean;
        enable_segment_level_entities: boolean;
      }>
    | undefined;
  data?:
    | Partial<{
        entities: {};
        segment_entities: Array<
          Partial<{
            start_time: number;
            end_time: number;
            entities: {};
          }>
        >;
      }>
    | undefined;
  error?: string | undefined;
};
type ExtractList = {
  object: "list";
  data: Array<Extract>;
  total: number;
  limit: number;
  offset: number;
};

const Extract: z.ZodType<Extract> = z
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
    extract_config: z
      .object({
        prompt: z.string(),
        schema: z.object({}).partial().strict().passthrough(),
        enable_video_level_entities: z.boolean().default(true),
        enable_segment_level_entities: z.boolean().default(true),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    data: z
      .object({
        entities: z.object({}).partial().strict().passthrough(),
        segment_entities: z.array(
          z
            .object({
              start_time: z.number(),
              end_time: z.number(),
              entities: z.object({}).partial().strict().passthrough(),
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
const ExtractList: z.ZodType<ExtractList> = z
  .object({
    object: z.literal("list"),
    data: z.array(Extract),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const NewExtract = z
  .object({
    url: z.string(),
    prompt: z.string().optional(),
    schema: z.object({}).partial().strict().passthrough().optional(),
    enable_video_level_entities: z.boolean().optional().default(true),
    enable_segment_level_entities: z.boolean().optional().default(true),
  })
  .strict()
  .passthrough();

export const schemas = {
  Extract,
  ExtractList,
  NewExtract,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/extract",
    alias: "createExtract",
    description: `Creates a new extract`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Extract structured data from a video`,
        type: "Body",
        schema: NewExtract,
      },
    ],
    response: Extract,
    errors: [
      {
        status: 400,
        description: `Invalid request or missing required prompt/schema`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Extract job not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 429,
        description: `Monthly extract jobs limit reached`,
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
    path: "/extract",
    alias: "listExtracts",
    description: `List all extract jobs with optional filtering`,
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
    ],
    response: ExtractList,
    errors: [
      {
        status: 400,
        description: `Invalid request or extract config requires at least one option enabled`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Extract job not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 429,
        description: `Monthly extract jobs limit reached`,
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
    path: "/extract/:job_id",
    alias: "getExtract",
    description: `Retrieve the current state of an extraction job`,
    requestFormat: "json",
    parameters: [
      {
        name: "job_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Extract,
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

export const ExtractApi = new Zodios("https://api.cloudglue.dev/v1", endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
