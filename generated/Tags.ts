import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

import { VideoTag } from './common';
import { ListVideoTagsResponse } from './common';
import { PaginationResponse } from './common';

const CreateVideoTagRequest = z
  .object({
    label: z.string(),
    value: z.string(),
    file_id: z.string().uuid(),
    segment_id: z.string().uuid().optional(),
  })
  .strict()
  .passthrough();
const UpdateVideoTagRequest = z
  .object({ label: z.string(), value: z.string() })
  .partial()
  .strict()
  .passthrough();

export const schemas = {
  CreateVideoTagRequest,
  UpdateVideoTagRequest,
};

const endpoints = makeApi([
  {
    method: 'post',
    path: '/tags',
    alias: 'createTag',
    description: `Create a new tag`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Tag creation parameters`,
        type: 'Body',
        schema: CreateVideoTagRequest,
      },
    ],
    response: VideoTag,
    errors: [
      {
        status: 400,
        description: `Invalid request or missing required label/value`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `File not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 429,
        description: `Resource limits exceeded (total tags per file or segment)`,
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
    method: 'get',
    path: '/tags',
    alias: 'listTags',
    description: `List all tags`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'type',
        type: 'Query',
        schema: z.enum(['file', 'segment']).optional(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().lte(100).optional().default(50),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional().default(0),
      },
    ],
    response: ListVideoTagsResponse,
  },
  {
    method: 'get',
    path: '/tags/:tag_id',
    alias: 'getTag',
    description: `Get a tag`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'tag_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: VideoTag,
    errors: [
      {
        status: 404,
        description: `Tag not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/tags/:tag_id',
    alias: 'deleteTag',
    description: `Delete a tag`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'tag_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z.object({ id: z.string() }).strict().passthrough(),
    errors: [
      {
        status: 404,
        description: `Tag not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'put',
    path: '/tags/:tag_id',
    alias: 'updateTag',
    description: `Update a tag`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Tag update parameters. At least one of label or value is required.`,
        type: 'Body',
        schema: UpdateVideoTagRequest,
      },
      {
        name: 'tag_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: VideoTag,
  },
]);

export const TagsApi = new Zodios('https://api.cloudglue.dev/v1', endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
