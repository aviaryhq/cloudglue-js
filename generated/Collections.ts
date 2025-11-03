import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { SegmentationConfig } from "./common";
import { SegmentationUniformConfig } from "./common";
import { SegmentationShotDetectorConfig } from "./common";
import { ThumbnailsConfig } from "./common";
import { File } from "./common";
import { FileSegmentationConfig } from "./common";
import { DescribeOutput } from "./common";
import { DescribeOutputPart } from "./common";
import { SpeechOutputPart } from "./common";

type Collection = {
  id: string;
  object: "collection";
  name: string;
  description?: (string | null) | undefined;
  collection_type: "media-descriptions" | "entities" | "rich-transcripts";
  extract_config?:
    | Partial<{
        prompt: string;
        schema: {};
        enable_video_level_entities: boolean;
        enable_segment_level_entities: boolean;
      }>
    | undefined;
  transcribe_config?:
    | Partial<{
        enable_summary: boolean;
        enable_speech: boolean;
        enable_scene_text: boolean;
        enable_visual_scene_description: boolean;
        enable_audio_description: boolean;
      }>
    | undefined;
  describe_config?:
    | Partial<{
        enable_summary: boolean;
        enable_speech: boolean;
        enable_scene_text: boolean;
        enable_visual_scene_description: boolean;
        enable_audio_description: boolean;
      }>
    | undefined;
  default_segmentation_config?: SegmentationConfig | undefined;
  default_thumbnails_config?: ThumbnailsConfig | undefined;
  created_at: number;
  file_count: number;
};
type NewCollection = {
  collection_type: "media-descriptions" | "entities" | "rich-transcripts";
  name: string;
  description?: (string | null) | undefined;
  describe_config?:
    | Partial<{
        enable_summary: boolean;
        enable_speech: boolean;
        enable_scene_text: boolean;
        enable_visual_scene_description: boolean;
        enable_audio_description: boolean;
      }>
    | undefined;
  extract_config?:
    | Partial<{
        prompt: string;
        schema: {};
        enable_video_level_entities: boolean;
        enable_segment_level_entities: boolean;
      }>
    | undefined;
  transcribe_config?:
    | Partial<{
        enable_summary: boolean;
        enable_speech: boolean;
        enable_scene_text: boolean;
        enable_visual_scene_description: boolean;
        enable_audio_description: boolean;
      }>
    | undefined;
  default_segmentation_config?: SegmentationConfig | undefined;
  default_thumbnails_config?: ThumbnailsConfig | undefined;
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
  status: "pending" | "processing" | "completed" | "failed" | "not_applicable";
  file?: File | undefined;
  segmentation?:
    | {
        id: string;
        status:
          | "pending"
          | "processing"
          | "completed"
          | "failed"
          | "not_applicable";
        file_id: string;
        segmentation_config: SegmentationConfig;
      }
    | undefined;
};
type AddCollectionFile = (
  | {
      file_id: string;
    }
  | {
      url: string;
    }
) &
  FileSegmentationConfig &
  Partial<{
    thumbnails_config: ThumbnailsConfig;
  }>;
type CollectionFileList = {
  object: "list";
  data: Array<CollectionFile>;
  total: number;
  limit: number;
  offset: number;
};
type RichTranscript = {
  collection_id: string;
  file_id: string;
  content?: string | undefined;
  title?: string | undefined;
  summary?: string | undefined;
  duration_seconds?: number | undefined;
  segment_summary?:
    | Array<
        Partial<{
          title: string;
          summary: string;
          start_time: number;
          end_time: number;
        }>
      >
    | undefined;
} & DescribeOutput;
type CollectionRichTranscriptsList = {
  object: "list";
  data: Array<{
    file_id: string;
    duration_seconds?: number | undefined;
    data: Partial<{
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
      DescribeOutput;
  }>;
  total: number;
  limit: number;
  offset: number;
};
type CollectionMediaDescriptionsList = {
  object: "list";
  data: Array<{
    file_id: string;
    added_at: number;
    object: "collection_file";
    duration_seconds?: number | undefined;
    data: Partial<{
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
      DescribeOutput;
  }>;
  total: number;
  limit: number;
  offset: number;
};
type MediaDescription = {
  collection_id: string;
  file_id: string;
  content?: string | undefined;
  title?: string | undefined;
  summary?: string | undefined;
  duration_seconds?: number | undefined;
  segment_summary?:
    | Array<
        Partial<{
          title: string;
          summary: string;
          start_time: number;
          end_time: number;
        }>
      >
    | undefined;
} & DescribeOutput;

const Collection: z.ZodType<Collection> = z
  .object({
    id: z.string(),
    object: z.literal("collection"),
    name: z.string(),
    description: z.string().nullish(),
    collection_type: z.enum([
      "media-descriptions",
      "entities",
      "rich-transcripts",
    ]),
    extract_config: z
      .object({
        prompt: z.string(),
        schema: z.object({}).partial().strict().passthrough(),
        enable_video_level_entities: z.boolean().default(false),
        enable_segment_level_entities: z.boolean().default(true),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    transcribe_config: z
      .object({
        enable_summary: z.boolean().default(true),
        enable_speech: z.boolean().default(true),
        enable_scene_text: z.boolean().default(false),
        enable_visual_scene_description: z.boolean().default(false),
        enable_audio_description: z.boolean().default(false),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    describe_config: z
      .object({
        enable_summary: z.boolean().default(true),
        enable_speech: z.boolean().default(true),
        enable_scene_text: z.boolean().default(true),
        enable_visual_scene_description: z.boolean().default(true),
        enable_audio_description: z.boolean().default(false),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    default_segmentation_config: SegmentationConfig.optional(),
    default_thumbnails_config: ThumbnailsConfig.optional(),
    created_at: z.number().int(),
    file_count: z.number().int(),
  })
  .strict()
  .passthrough();
const NewCollection: z.ZodType<NewCollection> = z
  .object({
    collection_type: z.enum([
      "media-descriptions",
      "entities",
      "rich-transcripts",
    ]),
    name: z.string(),
    description: z.string().nullish(),
    describe_config: z
      .object({
        enable_summary: z.boolean().default(true),
        enable_speech: z.boolean().default(true),
        enable_scene_text: z.boolean().default(true),
        enable_visual_scene_description: z.boolean().default(true),
        enable_audio_description: z.boolean().default(false),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    extract_config: z
      .object({
        prompt: z.string(),
        schema: z.object({}).partial().strict().passthrough(),
        enable_video_level_entities: z.boolean().default(false),
        enable_segment_level_entities: z.boolean().default(true),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    transcribe_config: z
      .object({
        enable_summary: z.boolean().default(true),
        enable_speech: z.boolean().default(true),
        enable_scene_text: z.boolean().default(false),
        enable_visual_scene_description: z.boolean().default(false),
        enable_audio_description: z.boolean().default(false),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    default_segmentation_config: SegmentationConfig.optional(),
    default_thumbnails_config: ThumbnailsConfig.optional(),
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
const AddCollectionFile: z.ZodType<AddCollectionFile> = z
  .union([
    z.object({ file_id: z.string() }).strict().passthrough(),
    z.object({ url: z.string() }).strict().passthrough(),
  ])
  .and(FileSegmentationConfig)
  .and(
    z
      .object({ thumbnails_config: ThumbnailsConfig })
      .partial()
      .strict()
      .passthrough()
  );
const CollectionFile: z.ZodType<CollectionFile> = z
  .object({
    collection_id: z.string(),
    file_id: z.string(),
    object: z.literal("collection_file"),
    added_at: z.number().int(),
    status: z.enum([
      "pending",
      "processing",
      "completed",
      "failed",
      "not_applicable",
    ]),
    file: File.optional(),
    segmentation: z
      .object({
        id: z.string().uuid(),
        status: z.enum([
          "pending",
          "processing",
          "completed",
          "failed",
          "not_applicable",
        ]),
        file_id: z.string().uuid(),
        segmentation_config: SegmentationConfig,
      })
      .strict()
      .passthrough()
      .optional(),
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
const MediaDescription: z.ZodType<MediaDescription> = z
  .object({
    collection_id: z.string(),
    file_id: z.string(),
    content: z.string().optional(),
    title: z.string().optional(),
    summary: z.string().optional(),
    duration_seconds: z.number().optional(),
    segment_summary: z
      .array(
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
      )
      .optional(),
  })
  .strict()
  .passthrough()
  .and(DescribeOutput);
const RichTranscript: z.ZodType<RichTranscript> = z
  .object({
    collection_id: z.string(),
    file_id: z.string(),
    content: z.string().optional(),
    title: z.string().optional(),
    summary: z.string().optional(),
    duration_seconds: z.number().optional(),
    segment_summary: z
      .array(
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
      )
      .optional(),
  })
  .strict()
  .passthrough()
  .and(DescribeOutput);
const CollectionRichTranscriptsList: z.ZodType<CollectionRichTranscriptsList> =
  z
    .object({
      object: z.literal("list"),
      data: z.array(
        z
          .object({
            file_id: z.string(),
            duration_seconds: z.number().optional(),
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
              .and(DescribeOutput),
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
const CollectionMediaDescriptionsList: z.ZodType<CollectionMediaDescriptionsList> =
  z
    .object({
      object: z.literal("list"),
      data: z.array(
        z
          .object({
            file_id: z.string(),
            added_at: z.number().int(),
            object: z.literal("collection_file"),
            duration_seconds: z.number().optional(),
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
              .and(DescribeOutput),
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
const CollectionDelete = z
  .object({ id: z.string(), object: z.literal("collection") })
  .strict()
  .passthrough();
const CollectionUpdate = z
  .object({ name: z.string(), description: z.string() })
  .partial()
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
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const CollectionEntitiesList = z
  .object({
    object: z.literal("list"),
    data: z.array(
      z
        .object({
          file_id: z.string(),
          data: z
            .object({
              entities: z.object({}).partial().strict().passthrough(),
              segment_entities: z
                .array(
                  z
                    .object({
                      start_time: z.number(),
                      end_time: z.number(),
                      entities: z.object({}).partial().strict().passthrough(),
                    })
                    .partial()
                    .strict()
                    .passthrough()
                )
                .optional(),
            })
            .strict()
            .passthrough(),
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

export const schemas = {
  Collection,
  NewCollection,
  CollectionList,
  AddCollectionFile,
  CollectionFile,
  CollectionFileList,
  MediaDescription,
  RichTranscript,
  CollectionRichTranscriptsList,
  CollectionMediaDescriptionsList,
  CollectionDelete,
  CollectionUpdate,
  CollectionFileDelete,
  FileEntities,
  CollectionEntitiesList,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/collections",
    alias: "createCollection",
    description: `Create a new collection to organize and process video files. Collections are used to group files together and process them in a consistent way.`,
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
        description: `Resource limits exceeded (total collections or files per collection)`,
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
      {
        name: "collection_type",
        type: "Query",
        schema: z
          .enum(["media-descriptions", "entities", "rich-transcripts"])
          .optional(),
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
    method: "put",
    path: "/collections/:collection_id",
    alias: "updateCollection",
    description: `Update a collection`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Collection update parameters`,
        type: "Body",
        schema: CollectionUpdate,
      },
      {
        name: "collection_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Collection,
    errors: [
      {
        status: 400,
        description: `Invalid request`,
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
        schema: AddCollectionFile,
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
            "completed",
            "failed",
            "not_applicable",
          ])
          .optional(),
      },
      {
        name: "added_before",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "added_after",
        type: "Query",
        schema: z.string().optional(),
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
      {
        name: "filter",
        type: "Query",
        schema: z.string().optional(),
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
    description: `Retrieve extracted entities for a specific file in a collection. Results are paginated with a default limit of 50 segment entities per request (maximum 100). Use limit and offset parameters to paginate through all results. This API is only available when the collection is created with collection_type &#x27;entities&#x27;`,
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
        schema: z.number().int().gte(1).lte(100).optional().default(50),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
    ],
    response: FileEntities,
    errors: [
      {
        status: 400,
        description: `Collection type is not &#x27;entities&#x27;`,
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
    path: "/collections/:collection_id/videos/:file_id/rich-transcripts",
    alias: "getTranscripts",
    description: `Retrieve rich transcription data for a specific file in a collection. This API is only available when the a collection is created with collection_type &#x27;rich-transcripts&#x27;`,
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
        name: "response_format",
        type: "Query",
        schema: z.enum(["json", "markdown"]).optional().default("json"),
      },
      {
        name: "start_time_seconds",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "end_time_seconds",
        type: "Query",
        schema: z.number().optional(),
      },
    ],
    response: RichTranscript,
    errors: [
      {
        status: 400,
        description: `Collection type is not &#x27;rich-transcripts&#x27;`,
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
    path: "/collections/:collection_id/entities",
    alias: "listCollectionEntities",
    description: `List all extracted entities for files in a collection. This API is only available when a collection is created with collection_type &#x27;entities&#x27;`,
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
        name: "order",
        type: "Query",
        schema: z.enum(["added_at", "filename"]).optional().default("added_at"),
      },
      {
        name: "sort",
        type: "Query",
        schema: z.enum(["asc", "desc"]).optional().default("desc"),
      },
      {
        name: "added_before",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "added_after",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: CollectionEntitiesList,
    errors: [
      {
        status: 400,
        description: `Collection type is not &#x27;entities&#x27;`,
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
  {
    method: "get",
    path: "/collections/:collection_id/rich-transcripts",
    alias: "listCollectionRichTranscripts",
    description: `List all rich transcription data for files in a collection. This API is only available when a collection is created with collection_type &#x27;rich-transcripts&#x27;`,
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
        schema: z.number().int().lte(100).optional().default(20),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().optional().default(0),
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
      {
        name: "added_before",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "added_after",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "response_format",
        type: "Query",
        schema: z.enum(["json", "markdown"]).optional().default("json"),
      },
    ],
    response: CollectionRichTranscriptsList,
    errors: [
      {
        status: 400,
        description: `Collection type is not &#x27;rich-transcripts&#x27;`,
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
  {
    method: "get",
    path: "/collections/:collection_id/media-descriptions",
    alias: "listCollectionMediaDescriptions",
    description: `List all media description data for files in a collection. This API is only available when a collection is created with collection_type &#x27;media-descriptions&#x27;`,
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
        schema: z.number().int().lte(100).optional().default(20),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().optional().default(0),
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
      {
        name: "added_before",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "added_after",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "response_format",
        type: "Query",
        schema: z.enum(["json", "markdown"]).optional().default("json"),
      },
    ],
    response: CollectionMediaDescriptionsList,
    errors: [
      {
        status: 400,
        description: `Collection type is not &#x27;media-descriptions&#x27;`,
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
  {
    method: "get",
    path: "/collections/:collection_id/videos/:file_id/media-descriptions",
    alias: "getMediaDescriptions",
    description: `Retrieve media description data for a specific file in a collection. This API is only available when the collection is created with collection_type &#x27;media-descriptions&#x27;`,
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
        name: "response_format",
        type: "Query",
        schema: z.enum(["json", "markdown"]).optional().default("json"),
      },
      {
        name: "start_time_seconds",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "end_time_seconds",
        type: "Query",
        schema: z.number().optional(),
      },
    ],
    response: MediaDescription,
    errors: [
      {
        status: 400,
        description: `Collection type is not &#x27;media-descriptions&#x27;`,
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
]);

export const CollectionsApi = new Zodios(
  "https://api.cloudglue.dev/v1",
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
