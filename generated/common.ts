import { z } from "zod";

export type File = {
  id: string;
  status:
    | "pending"
    | "processing"
    | "ready"
    | "completed"
    | "failed"
    | "not_applicable";
  bytes?: (number | null) | undefined;
  created_at?: number | undefined;
  filename?: string | undefined;
  uri: string;
  metadata?: ({} | null) | undefined;
  video_info?:
    | Partial<{
        duration_seconds: number | null;
        height: number | null;
        width: number | null;
        format: string | null;
        has_audio: boolean | null;
      }>
    | undefined;
};

export const File = z
  .object({
    id: z.string(),
    status: z.enum([
      "pending",
      "processing",
      "ready",
      "completed",
      "failed",
      "not_applicable",
    ]),
    bytes: z.union([z.number(), z.null()]).optional(),
    created_at: z.number().int().optional(),
    filename: z.string().optional(),
    uri: z.string(),
    metadata: z
      .union([z.object({}).partial().strict().passthrough(), z.null()])
      .optional(),
    video_info: z
      .object({
        duration_seconds: z.union([z.number(), z.null()]),
        height: z.union([z.number(), z.null()]),
        width: z.union([z.number(), z.null()]),
        format: z.union([z.string(), z.null()]),
        has_audio: z.union([z.boolean(), z.null()]),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
  })
  .strict()
  .passthrough();
