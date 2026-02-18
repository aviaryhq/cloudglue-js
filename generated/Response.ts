import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

import { SearchFilter } from './common';
import { SearchFilterCriteria } from './common';

type Response = Partial<{
  id: string;
  object: 'response';
  status: 'in_progress' | 'completed' | 'failed' | 'cancelled';
  created_at: number;
  model: string;
  instructions: string | null;
  output: Array<ResponseOutputMessage> | null;
  usage: ResponseUsage;
  error: ResponseError | null;
}>;
type CreateResponseRequest = {
  model: string;
  input: string | Array<ResponseInputMessage>;
  instructions?: (string | null) | undefined;
  temperature?: number | undefined;
  knowledge_base: ResponseKnowledgeBase;
  include?: Array<'cloudglue_citations.media_descriptions'> | undefined;
  background?: boolean | undefined;
  stream?: boolean | undefined;
};
type ResponseOutputMessage = Partial<{
  type: 'message';
  role: 'assistant';
  content: Array<ResponseOutputContent>;
}>;
type ResponseOutputContent = Partial<{
  type: 'output_text';
  text: string;
  annotations: Array<ResponseAnnotation>;
}>;
type ResponseAnnotation = {
  type: 'cloudglue_citation';
  collection_id: string;
  file_id: string;
  segment_id?: string | undefined;
  start_time: number;
  end_time?: number | undefined;
  context?: string | undefined;
  relevant_sources?: Array<string> | undefined;
  visual_scene_description?: Array<string> | undefined;
  scene_text?: Array<string> | undefined;
  speech?: Array<string> | undefined;
  audio_description?: Array<string> | undefined;
};
type ResponseUsage = Partial<{
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}>;
type ResponseError = Partial<{
  message: string;
  type: string;
  code: string;
}>;
type ResponseInputMessage = {
  type: 'message';
  role: 'developer' | 'user' | 'assistant';
  content: Array<ResponseInputContent>;
};
type ResponseInputContent = {
  type: 'input_text';
  text: string;
};
type ResponseKnowledgeBase = {
  type?: ('general_question_answering' | 'entity_backed_knowledge') | undefined;
  collections: Array<string>;
  filter?: SearchFilter | undefined;
  entity_backed_knowledge_config?: EntityBackedKnowledgeConfig | undefined;
};
type EntityBackedKnowledgeConfig = {
  entity_collections: Array<EntityCollectionConfig>;
  description?: string | undefined;
};
type EntityCollectionConfig = {
  name?: string | undefined;
  description?: string | undefined;
  collection_id: string;
};
type ResponseList = Partial<{
  object: 'list';
  data: Array<ResponseListItem>;
  total: number;
  limit: number;
  offset: number;
}>;
type ResponseListItem = Partial<{
  id: string;
  object: 'response';
  status: 'in_progress' | 'completed' | 'failed' | 'cancelled';
  created_at: number;
  model: string;
  instructions: string | null;
  usage: ResponseUsage;
}>;

const ResponseInputContent: z.ZodType<ResponseInputContent> = z
  .object({ type: z.literal('input_text'), text: z.string() })
  .strict()
  .passthrough();
const ResponseInputMessage: z.ZodType<ResponseInputMessage> = z
  .object({
    type: z.literal('message'),
    role: z.enum(['developer', 'user', 'assistant']),
    content: z.array(ResponseInputContent),
  })
  .strict()
  .passthrough();
const EntityCollectionConfig: z.ZodType<EntityCollectionConfig> = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    collection_id: z.string().uuid(),
  })
  .strict()
  .passthrough();
const EntityBackedKnowledgeConfig: z.ZodType<EntityBackedKnowledgeConfig> = z
  .object({
    entity_collections: z.array(EntityCollectionConfig).min(1),
    description: z.string().max(2000).optional(),
  })
  .strict()
  .passthrough();
const ResponseKnowledgeBase: z.ZodType<ResponseKnowledgeBase> = z
  .object({
    type: z
      .enum(['general_question_answering', 'entity_backed_knowledge'])
      .optional()
      .default('general_question_answering'),
    collections: z.array(z.string().uuid()).min(1),
    filter: SearchFilter.optional(),
    entity_backed_knowledge_config: EntityBackedKnowledgeConfig.optional(),
  })
  .strict()
  .passthrough();
const CreateResponseRequest: z.ZodType<CreateResponseRequest> = z
  .object({
    model: z.string().min(1),
    input: z.union([z.string(), z.array(ResponseInputMessage)]),
    instructions: z.string().optional(),
    temperature: z.number().gte(0).lte(2).optional(),
    knowledge_base: ResponseKnowledgeBase,
    include: z
      .array(z.literal('cloudglue_citations.media_descriptions'))
      .optional(),
    background: z.boolean().optional().default(false),
    stream: z.boolean().optional().default(false),
  })
  .strict()
  .passthrough();
const ResponseAnnotation: z.ZodType<ResponseAnnotation> = z
  .object({
    type: z.literal('cloudglue_citation'),
    collection_id: z.string().uuid(),
    file_id: z.string().uuid(),
    segment_id: z.string().uuid().optional(),
    start_time: z.number(),
    end_time: z.number().optional(),
    context: z.string().optional(),
    relevant_sources: z.array(z.string()).optional(),
    visual_scene_description: z.array(z.string()).optional(),
    scene_text: z.array(z.string()).optional(),
    speech: z.array(z.string()).optional(),
    audio_description: z.array(z.string()).optional(),
  })
  .strict()
  .passthrough();
const ResponseOutputContent: z.ZodType<ResponseOutputContent> = z
  .object({
    type: z.literal('output_text'),
    text: z.string(),
    annotations: z.array(ResponseAnnotation),
  })
  .partial()
  .strict()
  .passthrough();
const ResponseOutputMessage: z.ZodType<ResponseOutputMessage> = z
  .object({
    type: z.literal('message'),
    role: z.literal('assistant'),
    content: z.array(ResponseOutputContent),
  })
  .partial()
  .strict()
  .passthrough();
const ResponseUsage: z.ZodType<ResponseUsage> = z
  .object({
    input_tokens: z.number().int(),
    output_tokens: z.number().int(),
    total_tokens: z.number().int(),
  })
  .partial()
  .strict()
  .passthrough();
const ResponseError: z.ZodType<ResponseError> = z
  .object({ message: z.string(), type: z.string(), code: z.string() })
  .partial()
  .strict()
  .passthrough();
const Response: z.ZodType<Response> = z
  .object({
    id: z.string().uuid(),
    object: z.literal('response'),
    status: z.enum(['in_progress', 'completed', 'failed', 'cancelled']),
    created_at: z.number().int(),
    model: z.string(),
    instructions: z.string().nullable(),
    output: z.array(ResponseOutputMessage).nullable(),
    usage: ResponseUsage,
    error: ResponseError.nullable(),
  })
  .partial()
  .strict()
  .passthrough();
const ResponseListItem: z.ZodType<ResponseListItem> = z
  .object({
    id: z.string().uuid(),
    object: z.literal('response'),
    status: z.enum(['in_progress', 'completed', 'failed', 'cancelled']),
    created_at: z.number().int(),
    model: z.string(),
    instructions: z.string().nullable(),
    usage: ResponseUsage,
  })
  .partial()
  .strict()
  .passthrough();
const ResponseList: z.ZodType<ResponseList> = z
  .object({
    object: z.literal('list'),
    data: z.array(ResponseListItem),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .partial()
  .strict()
  .passthrough();
const DeleteResponseResult = z
  .object({
    id: z.string().uuid(),
    object: z.literal('response'),
    deleted: z.literal(true),
  })
  .partial()
  .strict()
  .passthrough();

export const schemas = {
  ResponseInputContent,
  ResponseInputMessage,
  EntityCollectionConfig,
  EntityBackedKnowledgeConfig,
  ResponseKnowledgeBase,
  CreateResponseRequest,
  ResponseAnnotation,
  ResponseOutputContent,
  ResponseOutputMessage,
  ResponseUsage,
  ResponseError,
  Response,
  ResponseListItem,
  ResponseList,
  DeleteResponseResult,
};

const endpoints = makeApi([
  {
    method: 'post',
    path: '/responses',
    alias: 'createResponse',
    description: `Create a new response using the Response API. This endpoint provides an OpenAI Responses-compatible interface for chat completions with video collections.

The response can be processed synchronously (default) or asynchronously using the &#x60;background&#x60; parameter.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Response creation parameters`,
        type: 'Body',
        schema: CreateResponseRequest,
      },
    ],
    response: Response,
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
  {
    method: 'get',
    path: '/responses',
    alias: 'listResponses',
    description: `List all responses with pagination and filtering options.`,
    requestFormat: 'json',
    parameters: [
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
        name: 'status',
        type: 'Query',
        schema: z
          .enum(['in_progress', 'completed', 'failed', 'cancelled'])
          .optional(),
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
    response: ResponseList,
    errors: [
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/responses/:id',
    alias: 'getResponse',
    description: `Retrieve a specific response by its ID.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: Response,
    errors: [
      {
        status: 404,
        description: `Response not found`,
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
    path: '/responses/:id',
    alias: 'deleteResponse',
    description: `Delete a response by ID. This operation is idempotent - deleting a non-existent response returns success.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: DeleteResponseResult,
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
    path: '/responses/:id/cancel',
    alias: 'cancelResponse',
    description: `Cancel a background response that is in progress. If the response is already completed, failed, or cancelled, this returns the response as-is.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: Response,
    errors: [
      {
        status: 404,
        description: `Response not found`,
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

export const ResponseApi = new Zodios(
  'https://api.cloudglue.dev/v1',
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
