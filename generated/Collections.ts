import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { File } from "./common";

type Collection = {
  id: string;
  object: "collection";
  name: string;
  description?: (string | null) | undefined;
  describe_config?:
    | Partial<{
        enable_speech: boolean;
        enable_scene_text: boolean;
        enable_visual_scene_description: boolean;
      }>
    | undefined;
  extract_config?:
    | Partial<{
        prompt: string;
        schema: {};
      }>
    | undefined;
  created_at: number;
  file_count: number;
};
type CollectionList = {
  object: "list";
  data: Array<Collection>;
  total: number;
  limit: number;
  offset: number;
};
type CollectionFile = {
  collection_id: string;
  file_id: string;
  object: "collection_file";
  added_at: number;
  status:
    | "pending"
    | "processing"
    | "ready"
    | "completed"
    | "failed"
    | "not_applicable";
  describe_status?:
    | (
        | "pending"
        | "processing"
        | "ready"
        | "completed"
        | "failed"
        | "not_applicable"
      )
    | undefined;
  extract_status?:
    | (
        | "pending"
        | "processing"
        | "ready"
        | "completed"
        | "failed"
        | "not_applicable"
      )
    | undefined;
  searchable_status?:
    | (
        | "pending"
        | "processing"
        | "ready"
        | "completed"
        | "failed"
        | "not_applicable"
      )
    | undefined;
  file?: File | undefined;
};
type CollectionFileList = {
  object: "list";
  data: Array<CollectionFile>;
  total: number;
  limit: number;
  offset: number;
};

const Collection: z.ZodType<Collection> = z
  .object({
    id: z.string(),
    object: z.literal("collection"),
    name: z.string(),
    description: z.union([z.string(), z.null()]).optional(),
    describe_config: z
      .object({
        enable_speech: z.boolean().default(true),
        enable_scene_text: z.boolean().default(true),
        enable_visual_scene_description: z.boolean().default(true),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    extract_config: z
      .object({
        prompt: z.string(),
        schema: z.object({}).partial().strict().passthrough(),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    created_at: z.number().int(),
    file_count: z.number().int(),
  })
  .strict()
  .passthrough();
const CollectionList: z.ZodType<CollectionList> = z
  .object({
    object: z.literal("list"),
    data: z.array(Collection),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const CollectionFile: z.ZodType<CollectionFile> = z
  .object({
    collection_id: z.string(),
    file_id: z.string(),
    object: z.literal("collection_file"),
    added_at: z.number().int(),
    status: z.enum([
      "pending",
      "processing",
      "ready",
      "completed",
      "failed",
      "not_applicable",
    ]),
    describe_status: z
      .enum([
        "pending",
        "processing",
        "ready",
        "completed",
        "failed",
        "not_applicable",
      ])
      .optional(),
    extract_status: z
      .enum([
        "pending",
        "processing",
        "ready",
        "completed",
        "failed",
        "not_applicable",
      ])
      .optional(),
    searchable_status: z
      .enum([
        "pending",
        "processing",
        "ready",
        "completed",
        "failed",
        "not_applicable",
      ])
      .optional(),
    file: File.optional(),
  })
  .strict()
  .passthrough();
const CollectionFileList: z.ZodType<CollectionFileList> = z
  .object({
    object: z.literal("list"),
    data: z.array(CollectionFile),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const NewCollection = z
  .object({
    name: z.string(),
    description: z.union([z.string(), z.null()]).optional(),
    describe_config: z
      .object({
        enable_speech: z.boolean().default(true),
        enable_scene_text: z.boolean().default(true),
        enable_visual_scene_description: z.boolean().default(true),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    extract_config: z
      .object({
        prompt: z.string(),
        schema: z.object({}).partial().strict().passthrough(),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
  })
  .strict()
  .passthrough();
const CollectionDelete = z
  .object({ id: z.string(), object: z.literal("collection") })
  .strict()
  .passthrough();
const CollectionFileDelete = z
  .object({
    collection_id: z.string(),
    file_id: z.string(),
    object: z.literal("collection_file"),
  })
  .strict()
  .passthrough();
const FileEntities = z
  .object({
    collection_id: z.string(),
    file_id: z.string(),
    entities: z.union([
      z.object({}).partial().strict().passthrough(),
      z.array(z.any()),
    ]),
    segment_entities: z
      .array(
        z
          .object({
            segment_id: z.union([z.string(), z.number()]),
            start_time: z.number(),
            end_time: z.number(),
            entities: z.object({}).partial().strict().passthrough(),
          })
          .partial()
          .strict()
          .passthrough()
      )
      .optional(),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const FileDescription = z
  .object({
    collection_id: z.string(),
    file_id: z.string(),
    title: z.string().optional(),
    summary: z.string().optional(),
    segment_docs: z
      .array(
        z
          .object({
            segment_id: z.union([z.string(), z.number()]),
            start_time: z.number(),
            end_time: z.number(),
            title: z.string(),
            summary: z.string(),
            visual_description: z.array(
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
          })
          .partial()
          .strict()
          .passthrough()
      )
      .optional(),
    total: z.number().int().optional(),
    limit: z.number().int().optional(),
    offset: z.number().int().optional(),
  })
  .strict()
  .passthrough();
const AddYouTubeCollectionFile = z
  .object({
    url: z.string(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
  })
  .strict()
  .passthrough();

export const schemas = {
  Collection,
  CollectionList,
  CollectionFile,
  CollectionFileList,
  NewCollection,
  CollectionDelete,
  CollectionFileDelete,
  FileEntities,
  FileDescription,
  AddYouTubeCollectionFile,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/collections",
    alias: "createCollection",
    description: `Create a new collection to organize and process video files`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Collection creation parameters`,
        type: "Body",
        schema: NewCollection,
      },
    ],
    response: Collection,
    errors: [
      {
        status: 400,
        description: `Invalid request or malformed YouTube URL`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 409,
        description: `Collection name already exists for this account`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 429,
        description: `Too many requests`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 509,
        description: `Resource limits exceeded (total collections or files per collection)`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/collections",
    alias: "listCollections",
    description: `List all collections`,
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
        name: "order",
        type: "Query",
        schema: z.enum(["name", "created_at"]).optional().default("created_at"),
      },
      {
        name: "sort",
        type: "Query",
        schema: z.enum(["asc", "desc"]).optional().default("desc"),
      },
    ],
    response: CollectionList,
    errors: [
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/collections/:collection_id",
    alias: "getCollection",
    description: `Retrieve details about a specific collection`,
    requestFormat: "json",
    parameters: [
      {
        name: "collection_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Collection,
    errors: [
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
  {
    method: "delete",
    path: "/collections/:collection_id",
    alias: "deleteCollection",
    description: `Delete a collection`,
    requestFormat: "json",
    parameters: [
      {
        name: "collection_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: CollectionDelete,
    errors: [
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
  {
    method: "post",
    path: "/collections/:collection_id/videos",
    alias: "addVideo",
    description: `Add a video to a collection`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `File association parameters`,
        type: "Body",
        schema: z.object({ file_id: z.string() }).strict().passthrough(),
      },
      {
        name: "collection_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: CollectionFile,
    errors: [
      {
        status: 400,
        description: `Invalid request`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Collection or file not found`,
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
    path: "/collections/:collection_id/videos",
    alias: "listVideos",
    description: `List all files in a collection`,
    requestFormat: "json",
    parameters: [
      {
        name: "collection_id",
        type: "Path",
        schema: z.string(),
      },
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
            "ready",
            "completed",
            "failed",
            "not_applicable",
          ])
          .optional(),
      },
      {
        name: "order",
        type: "Query",
        schema: z.enum(["added_at", "filename"]).optional().default("added_at"),
      },
      {
        name: "sort",
        type: "Query",
        schema: z.enum(["asc", "desc"]).optional().default("desc"),
      },
    ],
    response: CollectionFileList,
    errors: [
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
  {
    method: "get",
    path: "/collections/:collection_id/videos/:file_id",
    alias: "getVideo",
    description: `Retrieve information about a specific video file in a collection`,
    requestFormat: "json",
    parameters: [
      {
        name: "collection_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "file_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: CollectionFile,
    errors: [
      {
        status: 404,
        description: `Collection or file not found`,
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
    path: "/collections/:collection_id/videos/:file_id",
    alias: "deleteVideo",
    description: `Remove a video file from a collection`,
    requestFormat: "json",
    parameters: [
      {
        name: "collection_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "file_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: CollectionFileDelete,
    errors: [
      {
        status: 404,
        description: `Collection or file not found`,
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
    path: "/collections/:collection_id/videos/:file_id/entities",
    alias: "getEntities",
    description: `Retrieve all extracted entities for a specific file in a collection`,
    requestFormat: "json",
    parameters: [
      {
        name: "collection_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "file_id",
        type: "Path",
        schema: z.string(),
      },
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
    ],
    response: FileEntities,
    errors: [
      {
        status: 404,
        description: `Collection or file not found`,
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
    path: "/collections/:collection_id/videos/:file_id/description",
    alias: "getDescription",
    description: `Retrieve the processed video summary description and segment documents for a file in a collection`,
    requestFormat: "json",
    parameters: [
      {
        name: "collection_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "file_id",
        type: "Path",
        schema: z.string(),
      },
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
    ],
    response: FileDescription,
    errors: [
      {
        status: 404,
        description: `Collection or file not found`,
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
    method: "post",
    path: "/collections/:collection_id/youtube",
    alias: "addYouTubeVideo",
    description: `Add a YouTube video to a collection by URL`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `YouTube video URL parameters`,
        type: "Body",
        schema: AddYouTubeCollectionFile,
      },
      {
        name: "collection_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: CollectionFile,
    errors: [
      {
        status: 400,
        description: `Invalid request or YouTube URL`,
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

export const CollectionsApi = new Zodios(
  "https://api.cloudglue.dev/v1",
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
