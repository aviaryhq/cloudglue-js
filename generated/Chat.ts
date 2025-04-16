import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

type ChatCompletionResponse = Partial<{
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<
    Partial<{
      index: number;
      message: ChatMessage;
      citations: Array<
        Partial<{
          collection_id: string;
          file_id: string;
          segment_id: string;
          start_time: string | number;
          end_time: string | number;
          text: string;
          context: string;
          relevant_sources: Array<
            Partial<{
              text: string;
            }>
          >;
          visual_description: Array<
            Partial<{
              text: string;
              start_time: number;
              end_time: number;
            }>
          >;
          scene_text: Array<
            Partial<{
              text: string;
              start_time: number;
              end_time: number;
            }>
          >;
          speech: Array<
            Partial<{
              speaker: string;
              text: string;
              start_time: number;
              end_time: number;
            }>
          >;
        }>
      >;
    }>
  >;
  usage: Partial<{
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  }>;
}>;
type ChatCompletionRequest = {
  model: "nimbus-001";
  messages: Array<ChatMessage>;
  collections: Array<string>;
  filter?:
    | Partial<{
        metadata: Array<{
          path: string;
          operator:
            | "NotEqual"
            | "Equal"
            | "LessThan"
            | "GreaterThan"
            | "In"
            | "ContainsAny"
            | "ContainsAll";
          valueText?: string | undefined;
          valueTextArray?: Array<string> | undefined;
        }>;
      }>
    | undefined;
  force_search?: boolean | undefined;
  result_format?: ("text" | "markdown" | "json") | undefined;
  include_citations?: boolean | undefined;
  temperature?: number | undefined;
  top_p?: number | undefined;
  max_tokens?: number | undefined;
};
type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string | undefined;
};

const ChatMessage: z.ZodType<ChatMessage> = z
  .object({
    role: z.enum(["system", "user", "assistant"]),
    content: z.string(),
    name: z.string().optional(),
  })
  .strict()
  .passthrough();
const ChatCompletionRequest: z.ZodType<ChatCompletionRequest> = z
  .object({
    model: z.literal("nimbus-001"),
    messages: z.array(ChatMessage),
    collections: z.array(z.string()).min(1).max(1),
    filter: z
      .object({
        metadata: z.array(
          z
            .object({
              path: z.string(),
              operator: z.enum([
                "NotEqual",
                "Equal",
                "LessThan",
                "GreaterThan",
                "In",
                "ContainsAny",
                "ContainsAll",
              ]),
              valueText: z.string().optional(),
              valueTextArray: z.array(z.string()).optional(),
            })
            .strict()
            .passthrough()
        ),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    force_search: z.boolean().optional().default(false),
    result_format: z
      .enum(["text", "markdown", "json"])
      .optional()
      .default("text"),
    include_citations: z.boolean().optional().default(true),
    temperature: z.number().gte(0).lte(2).optional().default(0.7),
    top_p: z.number().gte(0).lte(1).optional().default(1),
    max_tokens: z.number().int().optional().default(1024),
  })
  .strict()
  .passthrough();
const ChatCompletionResponse: z.ZodType<ChatCompletionResponse> = z
  .object({
    id: z.string(),
    object: z.string(),
    created: z.number().int(),
    model: z.string(),
    choices: z.array(
      z
        .object({
          index: z.number().int(),
          message: ChatMessage,
          citations: z.array(
            z
              .object({
                collection_id: z.string(),
                file_id: z.string(),
                segment_id: z.string(),
                start_time: z.union([z.string(), z.number()]),
                end_time: z.union([z.string(), z.number()]),
                text: z.string(),
                context: z.string(),
                relevant_sources: z.array(
                  z
                    .object({ text: z.string() })
                    .partial()
                    .strict()
                    .passthrough()
                ),
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
          ),
        })
        .partial()
        .strict()
        .passthrough()
    ),
    usage: z
      .object({
        prompt_tokens: z.number().int(),
        completion_tokens: z.number().int(),
        total_tokens: z.number().int(),
      })
      .partial()
      .strict()
      .passthrough(),
  })
  .partial()
  .strict()
  .passthrough();

export const schemas = {
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/chat/completions",
    alias: "createCompletion",
    description: `Generate a model response to a conversation that can include references to video content`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Chat completion parameters`,
        type: "Body",
        schema: ChatCompletionRequest,
      },
    ],
    response: ChatCompletionResponse,
    errors: [
      {
        status: 400,
        description: `Invalid request`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Collections not found`,
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
        description: `Chat completion limits reached (monthly or daily)`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
]);

export const ChatApi = new Zodios("https://api.cloudglue.dev/v1", endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
