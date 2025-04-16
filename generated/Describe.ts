import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const Describe = z
  .object({
    job_id: z.string(),
    status: z.enum([
      "pending",
      "processing",
      "ready",
      "completed",
      "failed",
      "not_applicable",
    ]),
    data: z
      .object({
        url: z.string(),
        title: z.string(),
        summary: z.string(),
        segment_docs: z.array(
          z
            .object({
              segment_id: z.union([z.string(), z.number()]),
              start_time: z.number(),
              end_time: z.number(),
              title: z.string(),
              summary: z.string(),
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
      .optional(),
    error: z.string().optional(),
  })
  .strict()
  .passthrough();
const NewDescribe = z
  .object({
    url: z.string(),
    enable_speech: z.boolean().optional().default(true),
    enable_scene_text: z.boolean().optional().default(true),
    enable_visual_scene_description: z.boolean().optional().default(true),
  })
  .strict()
  .passthrough();

export const schemas = {
  Describe,
  NewDescribe,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/describe",
    alias: "createDescribe",
    description: `Creates a new describe job for comprehensive video description and transcription`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Generate rich, multimodal descriptions of video content`,
        type: "Body",
        schema: NewDescribe,
      },
    ],
    response: Describe,
    errors: [
      {
        status: 400,
        description: `Invalid request or describe config requires at least one option enabled`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Describe job not found`,
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
        description: `Monthly describe jobs limit reached`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/describe/:job_id",
    alias: "getDescribe",
    description: `Retrieve the current state of a describe job`,
    requestFormat: "json",
    parameters: [
      {
        name: "job_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Describe,
    errors: [
      {
        status: 404,
        description: `Job not found`,
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

export const DescribeApi = new Zodios(
  "https://api.cloudglue.dev/v1",
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
