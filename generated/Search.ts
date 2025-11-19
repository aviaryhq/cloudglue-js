import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

type SearchResponse = {
  id: string;
  object: "search";
  query?: string | undefined;
  scope: "file" | "segment" | "face";
  group_by_key?: "file" | undefined;
  group_count?: number | undefined;
  search_modalities?: SearchModalities | undefined;
  results: Array<
    | FileSearchResult
    | SegmentSearchResult
    | FaceSearchResult
    | SegmentGroupResult
    | FaceGroupResult
  >;
  total: number;
  limit: number;
};
type SearchRequest = Partial<{
  scope: "file" | "segment" | "face";
  collections: Array<string>;
  query: string;
  source_image: Partial<{
    url: string;
    base64: string;
  }>;
  limit: number;
  filter: SearchFilter;
  threshold: number;
  group_by_key: "file";
  sort_by: "score" | "item_count";
  search_modalities: SearchModalities;
}>;
type SearchModalities = Array<
  "general_content" | "speech_lexical" | "ocr_lexical"
>;
type FileSearchResult = {
  type: "file";
  file_id: string;
  collection_id: string;
  id: string;
  score: number;
  filename?: (string | null) | undefined;
  summary?: (string | null) | undefined;
  generated_title?: (string | null) | undefined;
  thumbnail_url?: string | undefined;
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
          speaker: string;
          text: string;
          start_time: number;
          end_time: number;
        }>
      >
    | undefined;
  thumbnail_url?: string | undefined;
};
type FaceSearchResult = {
  type: "face";
  file_id: string;
  collection_id: string;
  face_id: string;
  frame_id: string;
  score: number;
  timestamp: number;
  face_bounding_box?:
    | {
        height: number;
        width: number;
        top: number;
        left: number;
      }
    | undefined;
  thumbnail_url?: string | undefined;
};
type SegmentGroupResult = {
  type: "segment_group";
  matched_items: Array<SegmentSearchResult>;
  file_id: string;
  item_count: number;
  best_score: number;
};
type FaceGroupResult = {
  type: "face_group";
  matched_items: Array<FaceSearchResult>;
  file_id: string;
  item_count: number;
  best_score: number;
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
    | "In"
    | "Like";
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
      "Like",
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
const SearchModalities = z.array(
  z.enum(["general_content", "speech_lexical", "ocr_lexical"])
);
const SearchRequest: z.ZodType<SearchRequest> = z
  .object({
    scope: z.enum(["file", "segment", "face"]),
    collections: z.array(z.string().uuid()).min(1),
    query: z.string().min(1),
    source_image: z
      .object({ url: z.string(), base64: z.string() })
      .partial()
      .strict()
      .passthrough()
      .refine(
        (obj) => obj.url !== undefined || obj.base64 !== undefined,
        {
          message: "source_image must have at least one of 'url' or 'base64'",
        }
      ),
    limit: z.number().int().gte(1).default(10),
    filter: SearchFilter,
    threshold: z.number(),
    group_by_key: z.literal("file"),
    sort_by: z.enum(["score", "item_count"]).default("score"),
    search_modalities: SearchModalities,
  })
  .partial()
  .strict()
  .passthrough();
const FileSearchResult: z.ZodType<FileSearchResult> = z
  .object({
    type: z.literal("file"),
    file_id: z.string().uuid(),
    collection_id: z.string().uuid(),
    id: z.string().uuid(),
    score: z.number(),
    filename: z.string().nullish(),
    summary: z.string().nullish(),
    generated_title: z.string().nullish(),
    thumbnail_url: z.string().url().optional(),
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
    score: z.number(),
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
            speaker: z.string(),
            text: z.string(),
            start_time: z.number(),
            end_time: z.number(),
          })
          .partial()
          .strict()
          .passthrough()
      )
      .optional(),
    thumbnail_url: z.string().url().optional(),
  })
  .strict()
  .passthrough();
const FaceSearchResult: z.ZodType<FaceSearchResult> = z
  .object({
    type: z.literal("face"),
    file_id: z.string().uuid(),
    collection_id: z.string().uuid(),
    face_id: z.string().uuid(),
    frame_id: z.string().uuid(),
    score: z.number(),
    timestamp: z.number().gte(0),
    face_bounding_box: z
      .object({
        height: z.number().gte(0).lte(1),
        width: z.number().gte(0).lte(1),
        top: z.number().gte(0).lte(1),
        left: z.number().gte(0).lte(1),
      })
      .strict()
      .passthrough()
      .optional(),
    thumbnail_url: z.string().optional(),
  })
  .strict()
  .passthrough();
const SegmentGroupResult: z.ZodType<SegmentGroupResult> = z
  .object({
    type: z.literal("segment_group"),
    matched_items: z.array(SegmentSearchResult),
    file_id: z.string().uuid(),
    item_count: z.number().int(),
    best_score: z.number(),
  })
  .strict()
  .passthrough();
const FaceGroupResult: z.ZodType<FaceGroupResult> = z
  .object({
    type: z.literal("face_group"),
    matched_items: z.array(FaceSearchResult),
    file_id: z.string().uuid(),
    item_count: z.number().int(),
    best_score: z.number(),
  })
  .strict()
  .passthrough();
const SearchResponse: z.ZodType<SearchResponse> = z
  .object({
    id: z.string().uuid(),
    object: z.literal("search"),
    query: z.string().optional(),
    scope: z.enum(["file", "segment", "face"]),
    group_by_key: z.literal("file").optional(),
    group_count: z.number().int().optional(),
    search_modalities: SearchModalities.optional(),
    results: z.array(
      z.union([
        FileSearchResult,
        SegmentSearchResult,
        FaceSearchResult,
        SegmentGroupResult,
        FaceGroupResult,
      ])
    ),
    total: z.number().int(),
    limit: z.number().int(),
  })
  .strict()
  .passthrough();

export const schemas = {
  SearchFilterCriteria,
  SearchFilter,
  SearchModalities,
  SearchRequest,
  FileSearchResult,
  SegmentSearchResult,
  FaceSearchResult,
  SegmentGroupResult,
  FaceGroupResult,
  SearchResponse,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/search",
    alias: "searchContent",
    description: `Search for videos or video segments in collections to find relevant videos or moments/clips in a video`,
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
