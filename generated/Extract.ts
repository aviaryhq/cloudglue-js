import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const Extract = z
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
        entities: z.object({}).partial().strict().passthrough(),
        segment_entities: z.array(
          z
            .object({
              segment_id: z.union([z.string(), z.number()]),
              start_time: z.number(),
              end_time: z.number(),
              entities: z.object({}).partial().strict().passthrough(),
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
const NewExtract = z
  .object({
    url: z.string(),
    prompt: z.string().optional(),
    schema: z.object({}).partial().strict().passthrough().optional(),
  })
  .strict()
  .passthrough();

export const schemas = {
  Extract,
  NewExtract,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/extract",
    alias: "createExtract",
    description: `Creates a new extract`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Extract structured data from a video`,
        type: "Body",
        schema: NewExtract,
      },
    ],
    response: Extract,
    errors: [
      {
        status: 400,
        description: `Invalid request or missing required prompt/schema`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Extract job not found`,
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
        description: `Monthly extract jobs limit reached`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/extract/:job_id",
    alias: "getExtract",
    description: `Retrieve the current state of an extraction job`,
    requestFormat: "json",
    parameters: [
      {
        name: "job_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Extract,
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

export const ExtractApi = new Zodios("https://api.cloudglue.dev/v1", endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
