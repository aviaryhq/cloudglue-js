import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

type ShareableAsset = {
  id: string;
  file_id: string;
  file_segment_id?: string | undefined;
  title?: string | undefined;
  description?: string | undefined;
  metadata?: {} | undefined;
  preview_url?: string | undefined;
  media_download_url?: string | undefined;
  media_download_expires_at?: (number | null) | undefined;
  share_url?: string | undefined;
  status?: ('pending' | 'processing' | 'completed' | 'failed') | undefined;
  asset_type?: ('file' | 'file_segment') | undefined;
  created_at: number;
  object?: 'share' | undefined;
};
type ShareableAssetListResponse = {
  object: 'list';
  data: Array<ShareableAsset>;
  total: number;
  limit: number;
  offset: number;
};

const ShareableAsset: z.ZodType<ShareableAsset> = z
  .object({
    id: z.string().uuid(),
    file_id: z.string().uuid(),
    file_segment_id: z.string().uuid().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
    preview_url: z.string().optional(),
    media_download_url: z.string().optional(),
    media_download_expires_at: z.number().nullish(),
    share_url: z.string().optional(),
    status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
    asset_type: z.enum(['file', 'file_segment']).optional(),
    created_at: z.number(),
    object: z.literal('share').optional(),
  })
  .strict()
  .passthrough();
const ShareableAssetListResponse: z.ZodType<ShareableAssetListResponse> = z
  .object({
    object: z.literal('list'),
    data: z.array(ShareableAsset),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const CreateShareableAssetRequest = z
  .object({
    file_id: z.string().uuid(),
    file_segment_id: z.string().uuid().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    metadata: z.object({}).partial().strict().passthrough().optional(),
  })
  .strict()
  .passthrough();
const UpdateShareableAssetRequest = z
  .object({
    title: z.string(),
    description: z.string(),
    metadata: z.object({}).partial().strict().passthrough(),
  })
  .partial()
  .strict()
  .passthrough();

export const schemas = {
  ShareableAsset,
  ShareableAssetListResponse,
  CreateShareableAssetRequest,
  UpdateShareableAssetRequest,
};

const endpoints = makeApi([
  {
    method: 'post',
    path: '/share',
    alias: 'createShareableAsset',
    description: `Create a publicly available shareable asset`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Shareable asset creation request parameters`,
        type: 'Body',
        schema: CreateShareableAssetRequest,
      },
    ],
    response: ShareableAsset,
    errors: [
      {
        status: 400,
        description: `Invalid request parameters or configuration`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `File or file segment not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 409,
        description: `Shareable asset already exists`,
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
    path: '/share',
    alias: 'listShareableAssets',
    description: `List shareable assets`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'file_id',
        type: 'Query',
        schema: z.string().uuid().optional(),
      },
      {
        name: 'file_segment_id',
        type: 'Query',
        schema: z.string().uuid().optional(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(100).optional().default(50),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().gte(0).optional().default(0),
      },
      {
        name: 'created_before',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'created_after',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: ShareableAssetListResponse,
  },
  {
    method: 'get',
    path: '/share/:id',
    alias: 'getShareableAsset',
    description: `Get a shareable asset`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: ShareableAsset,
    errors: [
      {
        status: 404,
        description: `Shareable asset not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/share/:id',
    alias: 'deleteShareableAsset',
    description: `Delete a shareable asset`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({ id: z.string().uuid(), object: z.literal('share') })
      .strict()
      .passthrough(),
    errors: [
      {
        status: 404,
        description: `Shareable asset not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'put',
    path: '/share/:id',
    alias: 'updateShareableAsset',
    description: `Update a shareable asset`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Shareable asset update request parameters`,
        type: 'Body',
        schema: UpdateShareableAssetRequest,
      },
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: ShareableAsset,
    errors: [
      {
        status: 404,
        description: `Shareable asset not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
]);

export const ShareApi = new Zodios('https://api.cloudglue.dev/v1', endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
