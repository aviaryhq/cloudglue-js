import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

type WebhookList = {
  object: 'list';
  data: Array<Webhook>;
  total: number;
  limit: number;
  offset: number;
};
type Webhook = {
  id: string;
  object: 'webhook';
  created_at: number;
  webhook_secret: string;
  endpoint: string;
  active: boolean;
  description?: string | undefined;
  subscribed_events: Array<WebhookEvents>;
};
type WebhookEvents =
  | 'describe.job.processing'
  | 'describe.job.completed'
  | 'describe.job.failed'
  | 'extract.job.processing'
  | 'extract.job.completed'
  | 'extract.job.failed'
  | 'file.job.processing'
  | 'file.job.completed'
  | 'file.job.failed'
  | 'file.job.deleted'
  | 'collection.file.job.processing'
  | 'collection.file.job.completed'
  | 'collection.file.job.failed'
  | 'collection.file.job.deleted'
  | 'segment.job.processing'
  | 'segment.job.completed'
  | 'segment.job.failed';
type WebhookCreateRequest = Partial<{
  description: string;
  endpoint: string;
  subscribed_events: Array<WebhookEvents>;
}>;
type WebhookUpdateRequest = Partial<{
  description: string;
  endpoint: string;
  subscribed_events: Array<WebhookEvents>;
  active: boolean;
}>;

const WebhookEvents = z.enum([
  'describe.job.processing',
  'describe.job.completed',
  'describe.job.failed',
  'extract.job.processing',
  'extract.job.completed',
  'extract.job.failed',
  'file.job.processing',
  'file.job.completed',
  'file.job.failed',
  'file.job.deleted',
  'collection.file.job.processing',
  'collection.file.job.completed',
  'collection.file.job.failed',
  'collection.file.job.deleted',
  'segment.job.processing',
  'segment.job.completed',
  'segment.job.failed',
]);
const Webhook: z.ZodType<Webhook> = z
  .object({
    id: z.string(),
    object: z.literal('webhook'),
    created_at: z.number().int(),
    webhook_secret: z.string(),
    endpoint: z.string(),
    active: z.boolean(),
    description: z.string().optional(),
    subscribed_events: z.array(WebhookEvents),
  })
  .strict()
  .passthrough();
const WebhookList: z.ZodType<WebhookList> = z
  .object({
    object: z.literal('list'),
    data: z.array(Webhook),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const WebhookCreateRequest: z.ZodType<WebhookCreateRequest> = z
  .object({
    description: z.string(),
    endpoint: z.string(),
    subscribed_events: z.array(WebhookEvents),
  })
  .partial()
  .strict()
  .passthrough();
const WebhookUpdateRequest: z.ZodType<WebhookUpdateRequest> = z
  .object({
    description: z.string(),
    endpoint: z.string(),
    subscribed_events: z.array(WebhookEvents),
    active: z.boolean(),
  })
  .partial()
  .strict()
  .passthrough();
const WebhookDeleteResponse = z
  .object({ id: z.string(), object: z.literal('webhook') })
  .strict()
  .passthrough();

export const schemas = {
  WebhookEvents,
  Webhook,
  WebhookList,
  WebhookCreateRequest,
  WebhookUpdateRequest,
  WebhookDeleteResponse,
};

const endpoints = makeApi([
  {
    method: 'get',
    path: '/webhooks',
    alias: 'listWebhooks',
    description: `List all webhooks`,
    requestFormat: 'json',
    parameters: [
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
      {
        name: 'order',
        type: 'Query',
        schema: z.literal('created_at').optional().default('created_at'),
      },
      {
        name: 'sort',
        type: 'Query',
        schema: z.enum(['asc', 'desc']).optional().default('desc'),
      },
    ],
    response: WebhookList,
    errors: [
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'post',
    path: '/webhooks',
    alias: 'createWebhook',
    description: `Create a webhook`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Webhook creation parameters`,
        type: 'Body',
        schema: WebhookCreateRequest,
      },
    ],
    response: Webhook,
    errors: [
      {
        status: 404,
        description: `Webhook not found`,
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
    path: '/webhooks/:webhook_id',
    alias: 'getWebhookById',
    description: `Get a webhook by ID`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'webhook_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: Webhook,
    errors: [
      {
        status: 404,
        description: `Webhook not found`,
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
    method: 'delete',
    path: '/webhooks/:webhook_id',
    alias: 'deleteWebhook',
    description: `Delete a webhook`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'webhook_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: WebhookDeleteResponse,
    errors: [
      {
        status: 404,
        description: `Webhook not found`,
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
    method: 'put',
    path: '/webhooks/:webhook_id',
    alias: 'updateWebhook',
    description: `Update a webhook`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Webhook update parameters`,
        type: 'Body',
        schema: WebhookUpdateRequest,
      },
      {
        name: 'webhook_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: Webhook,
    errors: [
      {
        status: 404,
        description: `Webhook not found`,
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

export const WebhooksApi = new Zodios(
  'https://api.cloudglue.dev/v1',
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
