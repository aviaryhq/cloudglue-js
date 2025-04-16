import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { File } from "./common";

type FileList = {
  object: "list";
  data: Array<File>;
  total: number;
  limit: number;
  offset: number;
};

const FileList: z.ZodType<FileList> = z
  .object({
    object: z.literal("list"),
    data: z.array(File),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const FileUpload = z
  .object({
    file: z.instanceof(globalThis.File),
    metadata: z.object({}).partial().strict().passthrough().optional(),
  })
  .strict()
  .passthrough();
const FileDelete = z
  .object({ id: z.string(), object: z.literal("file") })
  .strict()
  .passthrough();

export const schemas = {
  FileList,
  FileUpload,
  FileDelete,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/files",
    alias: "uploadFile",
    description: `Upload a video file that can be used with CloudGlue services`,
    requestFormat: "form-data",
    parameters: [
      {
        name: "body",
        description: `Upload a video file`,
        type: "Body",
        schema: FileUpload,
      },
    ],
    response: File,
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
        description: `Resource limits exceeded (monthly upload limit, total duration, file size, or total files)`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/files",
    alias: "listFiles",
    description: `List files that have been uploaded to CloudGlue`,
    requestFormat: "json",
    parameters: [
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
    response: File,
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
]);

export const FilesApi = new Zodios("https://api.cloudglue.dev/v1", endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
