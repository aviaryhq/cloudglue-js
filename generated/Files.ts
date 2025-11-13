import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";
import { File as CloudglueFile } from "./common";
import { Segmentation, SegmentationConfig, SegmentationUniformConfig, SegmentationShotDetectorConfig, SegmentationManualConfig, ThumbnailsConfig, ThumbnailList, Thumbnail, FrameExtraction, FrameExtractionConfig, FrameExtractionUniformConfig, FrameExtractionThumbnailsConfig } from "./common";

type FileList = {
  object: "list";
  data: Array<CloudglueFile>;
  total: number;
  limit: number;
  offset: number;
};
type SegmentationList = {
  object: "list";
  data: Array<Segmentation>;
  total: number;
  limit: number;
  offset: number;
};
type FrameExtractionList = {
  object: "list";
  data: Array<{
    frame_extraction_id: string;
    status: "pending" | "processing" | "completed" | "failed";
    created_at: number;
    file_id: string;
    frame_extraction_config: FrameExtractionConfig;
    frame_count?: number | undefined;
  }>;
  total: number;
  limit: number;
  offset: number;
};

const FileList: z.ZodType<FileList> = z
  .object({
    object: z.literal("list"),
    data: z.array(CloudglueFile),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const SegmentationList: z.ZodType<SegmentationList> = z
  .object({
    object: z.literal("list"),
    data: z.array(Segmentation),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const FrameExtractionList: z.ZodType<FrameExtractionList> = z
  .object({
    object: z.literal("list"),
    data: z.array(
      z
        .object({
          frame_extraction_id: z.string().uuid(),
          status: z.enum(["pending", "processing", "completed", "failed"]),
          created_at: z.number().gte(0),
          file_id: z.string().uuid(),
          frame_extraction_config: FrameExtractionConfig,
          frame_count: z.number().gte(0).optional(),
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
const FileUpload = z
  .object({
    file: z.instanceof(File),
    metadata: z.object({}).partial().strict().passthrough().optional(),
    enable_segment_thumbnails: z.boolean().optional().default(false),
  })
  .strict()
  .passthrough();
const FileDelete = z
  .object({ id: z.string(), object: z.literal("file") })
  .strict()
  .passthrough();
const FileUpdate = z
  .object({
    metadata: z.object({}).partial().strict().passthrough(),
    filename: z.string(),
  })
  .partial()
  .strict()
  .passthrough();
const createFileSegmentation_Body = SegmentationConfig;
const createFileFrameExtraction_Body = FrameExtractionConfig;

export const schemas = {
  FileList,
  SegmentationList,
  FrameExtractionList,
  FileUpload,
  FileDelete,
  FileUpdate,
  createFileSegmentation_Body,
  createFileFrameExtraction_Body,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/files",
    alias: "uploadFile",
    description: `Upload a video file that can be used with Cloudglue services`,
    requestFormat: "form-data",
    parameters: [
      {
        name: "body",
        description: `Upload a video file`,
        type: "Body",
        schema: FileUpload,
      },
    ],
    response: CloudglueFile,
    errors: [
      {
        status: 400,
        description: `Invalid request, missing file, invalid metadata, or video duration exceeds limits`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 415,
        description: `Unsupported file type`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 429,
        description: `Resource limits exceeded (monthly upload limit, total duration, file size, or total files)`,
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
    path: "/files",
    alias: "listFiles",
    description: `List files that have been uploaded to Cloudglue`,
    requestFormat: "json",
    parameters: [
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
        schema: z
          .enum(["created_at", "filename"])
          .optional()
          .default("created_at"),
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
    response: FileList,
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
    path: "/files/:file_id",
    alias: "getFile",
    description: `Retrieve details about a specific file`,
    requestFormat: "json",
    parameters: [
      {
        name: "file_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: CloudglueFile,
    errors: [
      {
        status: 404,
        description: `File not found`,
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
    path: "/files/:file_id",
    alias: "deleteFile",
    description: `Delete a file`,
    requestFormat: "json",
    parameters: [
      {
        name: "file_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: FileDelete,
    errors: [
      {
        status: 404,
        description: `File not found`,
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
    path: "/files/:file_id",
    alias: "updateFile",
    description: `Update a file`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `File update parameters`,
        type: "Body",
        schema: FileUpdate,
      },
      {
        name: "file_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: CloudglueFile,
    errors: [
      {
        status: 400,
        description: `Invalid request or malformed file update parameters`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/files/:file_id/segmentations",
    alias: "createFileSegmentation",
    description: `Create a new segmentation for a file using the specified segmentation configuration`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Segmentation configuration`,
        type: "Body",
        schema: createFileSegmentation_Body,
      },
      {
        name: "file_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: Segmentation,
    errors: [
      {
        status: 400,
        description: `Invalid request or file duration is less than window size`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `File not found`,
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
    path: "/files/:file_id/segmentations",
    alias: "listFileSegmentations",
    description: `List all segmentations for a specific file`,
    requestFormat: "json",
    parameters: [
      {
        name: "file_id",
        type: "Path",
        schema: z.string().uuid(),
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
    response: SegmentationList,
    errors: [
      {
        status: 404,
        description: `File not found`,
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
    path: "/files/:file_id/thumbnails",
    alias: "getThumbnails",
    description: `Get all thumbnails for a file`,
    requestFormat: "json",
    parameters: [
      {
        name: "file_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "is_default",
        type: "Query",
        schema: z.boolean().optional().default(false),
      },
      {
        name: "segmentation_id",
        type: "Query",
        schema: z.string().uuid().optional(),
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
    response: ThumbnailList,
    errors: [
      {
        status: 404,
        description: `File not found`,
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
    path: "/files/:file_id/frames",
    alias: "createFileFrameExtraction",
    description: `Create a new frame extraction for a file using the specified frame extraction configuration. This is an async operation that returns immediately with a &#x27;pending&#x27; status. Results are cached, so identical requests will return the same frame extraction.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Frame extraction configuration`,
        type: "Body",
        schema: createFileFrameExtraction_Body,
      },
      {
        name: "file_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: FrameExtraction,
    errors: [
      {
        status: 400,
        description: `Invalid request or file duration is less than specified time range`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `File not found`,
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
    path: "/files/:file_id/frames",
    alias: "listFileFrameExtractions",
    description: `List all frame extractions for a specific file`,
    requestFormat: "json",
    parameters: [
      {
        name: "file_id",
        type: "Path",
        schema: z.string().uuid(),
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
    response: FrameExtractionList,
    errors: [
      {
        status: 404,
        description: `File not found`,
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

export const FilesApi = new Zodios("https://api.cloudglue.dev/v1", endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
