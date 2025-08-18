import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

type SearchResponse = {
  object: "search";
  query: string;
  scope: "file" | "segment";
  results: Array<FileSearchResult | SegmentSearchResult>;
  total: number;
  limit: number;
};
type SearchRequest = {
  scope: "file" | "segment";
  collections: Array<string>;
  query: string;
  limit?: number | undefined;
  filter?: SearchFilter | undefined;
};
type FileSearchResult = {
  type: "file";
  file_id: string;
  collection_id: string;
  id: string;
  score: number;
  filename?: (string | null) | undefined;
  summary?: (string | null) | undefined;
  generated_title?: (string | null) | undefined;
};
type SegmentSearchResult = {
  type: "segment";
  file_id: string;
  collection_id: string;
  segment_id: string;
  id: string;
  score: number;
  start_time: number;
  end_time: number;
  title?: (string | null) | undefined;
  filename?: (string | null) | undefined;
  visual_description?:
    | Array<
        Partial<{
          text: string;
          start_time: number;
          end_time: number;
        }>
      >
    | undefined;
  scene_text?:
    | Array<
        Partial<{
          text: string;
          start_time: number;
          end_time: number;
        }>
      >
    | undefined;
  speech?:
    | Array<
        Partial<{
          text: string;
          start_time: number;
          end_time: number;
        }>
      >
    | undefined;
};
type SearchFilter = Partial<{
  metadata: Array<SearchFilterCriteria>;
  video_info: Array<
    SearchFilterCriteria &
      Partial<{
        path: "duration_seconds" | "has_audio";
      }>
  >;
  file: Array<
    SearchFilterCriteria &
      Partial<{
        path: "bytes" | "filename" | "uri" | "created_at" | "id";
      }>
  >;
}>;
type SearchFilterCriteria = {
  path: string;
  operator:
    | "NotEqual"
    | "Equal"
    | "LessThan"
    | "GreaterThan"
    | "ContainsAny"
    | "ContainsAll"
    | "In";
  valueText?: string | undefined;
  valueTextArray?: Array<string> | undefined;
};

const SearchFilterCriteria: z.ZodType<SearchFilterCriteria> = z
  .object({
    path: z.string(),
    operator: z.enum([
      "NotEqual",
      "Equal",
      "LessThan",
      "GreaterThan",
      "ContainsAny",
      "ContainsAll",
      "In",
    ]),
    valueText: z.string().optional(),
    valueTextArray: z.array(z.string()).optional(),
  })
  .strict()
  .passthrough();
const SearchFilter: z.ZodType<SearchFilter> = z
  .object({
    metadata: z.array(SearchFilterCriteria),
    video_info: z.array(
      SearchFilterCriteria.and(
        z
          .object({ path: z.enum(["duration_seconds", "has_audio"]) })
          .partial()
          .strict()
          .passthrough()
      )
    ),
    file: z.array(
      SearchFilterCriteria.and(
        z
          .object({
            path: z.enum(["bytes", "filename", "uri", "created_at", "id"]),
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
const SearchRequest: z.ZodType<SearchRequest> = z
  .object({
    scope: z.enum(["file", "segment"]),
    collections: z.array(z.string().uuid()).min(1),
    query: z.string().min(1),
    limit: z.number().int().gte(1).lte(100).optional().default(10),
    filter: SearchFilter.optional(),
  })
  .strict()
  .passthrough();
const FileSearchResult: z.ZodType<FileSearchResult> = z
  .object({
    type: z.literal("file"),
    file_id: z.string().uuid(),
    collection_id: z.string().uuid(),
    id: z.string().uuid(),
    score: z.number().gte(0).lte(1),
    filename: z.string().nullish(),
    summary: z.string().nullish(),
    generated_title: z.string().nullish(),
  })
  .strict()
  .passthrough();
const SegmentSearchResult: z.ZodType<SegmentSearchResult> = z
  .object({
    type: z.literal("segment"),
    file_id: z.string().uuid(),
    collection_id: z.string().uuid(),
    segment_id: z.string().uuid(),
    id: z.string().uuid(),
    score: z.number().gte(0).lte(1),
    start_time: z.number(),
    end_time: z.number(),
    title: z.string().nullish(),
    filename: z.string().nullish(),
    visual_description: z
      .array(
        z
          .object({
            text: z.string(),
            start_time: z.number(),
            end_time: z.number(),
          })
          .partial()
          .strict()
          .passthrough()
      )
      .optional(),
    scene_text: z
      .array(
        z
          .object({
            text: z.string(),
            start_time: z.number(),
            end_time: z.number(),
          })
          .partial()
          .strict()
          .passthrough()
      )
      .optional(),
    speech: z
      .array(
        z
          .object({
            text: z.string(),
            start_time: z.number(),
            end_time: z.number(),
          })
          .partial()
          .strict()
          .passthrough()
      )
      .optional(),
  })
  .strict()
  .passthrough();
const SearchResponse: z.ZodType<SearchResponse> = z
  .object({
    object: z.literal("search"),
    query: z.string(),
    scope: z.enum(["file", "segment"]),
    results: z.array(z.union([FileSearchResult, SegmentSearchResult])),
    total: z.number().int(),
    limit: z.number().int(),
  })
  .strict()
  .passthrough();

export const schemas = {
  SearchFilterCriteria,
  SearchFilter,
  SearchRequest,
  FileSearchResult,
  SegmentSearchResult,
  SearchResponse,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/search",
    alias: "searchContent",
    description: `Search for videos or video segments in collections to find relevant videos or moments/clips in a video. Supports filtering by metadata, video info, and file properties.

**Important:** Currently only rich-transcript collections support search. For file-level search (scope&#x3D;&#x27;file&#x27;), the collection must be configured with &#x27;enable_summary: true&#x27; in the transcribe_config.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Search parameters`,
        type: "Body",
        schema: SearchRequest,
      },
    ],
    response: SearchResponse,
    errors: [
      {
        status: 400,
        description: `Invalid request parameters`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Collection not found`,
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

export const SearchApi = new Zodios("https://api.cloudglue.dev/v1", endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
