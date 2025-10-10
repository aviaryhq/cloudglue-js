import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { FrameExtraction } from "./common";
import { FrameExtractionConfig } from "./common";
import { FrameExtractionUniformConfig } from "./common";
import { FrameExtractionThumbnailsConfig } from "./common";

const endpoints = makeApi([
  {
    method: "get",
    path: "/frames/:frame_extraction_id",
    alias: "getFrameExtraction",
    description: `Retrieve details about a specific frame extraction including its frames`,
    requestFormat: "json",
    parameters: [
      {
        name: "frame_extraction_id",
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
    response: FrameExtraction,
    errors: [
      {
        status: 404,
        description: `Frame extraction not found`,
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
    path: "/frames/:frame_extraction_id",
    alias: "deleteFrameExtraction",
    description: `Delete a specific frame extraction`,
    requestFormat: "json",
    parameters: [
      {
        name: "frame_extraction_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({ id: z.string().uuid() }).strict().passthrough(),
    errors: [
      {
        status: 404,
        description: `Frame extraction not found`,
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

export const FramesApi = new Zodios("https://api.cloudglue.dev/v1", endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
