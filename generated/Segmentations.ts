import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { Segmentation } from "./common";
import { SegmentationConfig } from "./common";
import { SegmentationUniformConfig } from "./common";
import { SegmentationShotDetectorConfig } from "./common";
import { ThumbnailsConfig } from "./common";
import { ThumbnailList } from "./common";
import { Thumbnail } from "./common";

const endpoints = makeApi([
  {
    method: "get",
    path: "/segmentations/:segmentation_id",
    alias: "getSegmentation",
    description: `Retrieve details about a specific segmentation including its segments`,
    requestFormat: "json",
    parameters: [
      {
        name: "segmentation_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(10),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
    ],
    response: Segmentation,
    errors: [
      {
        status: 404,
        description: `Segmentation not found`,
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
    path: "/segmentations/:segmentation_id",
    alias: "deleteSegmentation",
    description: `Delete a specific segmentation`,
    requestFormat: "json",
    parameters: [
      {
        name: "segmentation_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({ id: z.string().uuid() }).strict().passthrough(),
    errors: [
      {
        status: 404,
        description: `Segmentation not found`,
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
    path: "/segmentations/:segmentation_id/thumbnails",
    alias: "getSegmentationThumbnails",
    description: `Get all thumbnails for a segmentation`,
    requestFormat: "json",
    parameters: [
      {
        name: "segmentation_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "segment_ids",
        type: "Query",
        schema: z.string().optional(),
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
        description: `Segmentation not found`,
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

export const SegmentationsApi = new Zodios(
  "https://api.cloudglue.dev/v1",
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
