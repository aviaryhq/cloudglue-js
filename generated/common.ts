import { z } from "zod";

export type FileSegmentationConfig = Partial<{
  segmentation_id: string;
  segmentation_config: SegmentationConfig;
}>;
export type SegmentationConfig = {
  strategy: "uniform" | "shot-detector";
  uniform_config?: SegmentationUniformConfig | undefined;
  shot_detector_config?: SegmentationShotDetectorConfig | undefined;
  start_time_seconds?: number | undefined;
  end_time_seconds?: number | undefined;
};
export type SegmentationUniformConfig = {
  window_seconds: number;
  hop_seconds?: number | undefined;
};
export type SegmentationShotDetectorConfig = {
  threshold?: (number | null) | undefined;
  min_seconds?: (number | null) | undefined;
  max_seconds?: (number | null) | undefined;
  detector: "adaptive" | "content";
};
export type File = {
  id: string;
  status: "pending" | "processing" | "completed" | "failed" | "not_applicable";
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
export type Segmentation = {
  segmentation_id: string;
  status: "pending" | "processing" | "completed" | "failed" | "not_applicable";
  created_at: number;
  file_id: string;
  segmentation_config: SegmentationConfig;
  total_segments?: number | undefined;
  data?:
    | {
        object: "list";
        segments: Array<{
          id: string;
          start_time: number;
          end_time: number;
        }>;
        total: number;
        limit: number;
        offset: number;
      }
    | undefined;
};

export const SegmentationUniformConfig = z
  .object({
    window_seconds: z.number().gte(2).lte(60),
    hop_seconds: z.number().gte(1).lte(60).optional(),
  })
  .strict()
  .passthrough();
export const SegmentationShotDetectorConfig = z
  .object({
    threshold: z.number().gte(0).nullish(),
    min_seconds: z.number().gte(2).lte(60).nullish(),
    max_seconds: z.number().gte(2).lte(60).nullish(),
    detector: z.enum(["adaptive", "content"]),
  })
  .strict()
  .passthrough();
export const SegmentationConfig = z
  .object({
    strategy: z.enum(["uniform", "shot-detector"]),
    uniform_config: SegmentationUniformConfig.optional(),
    shot_detector_config: SegmentationShotDetectorConfig.optional(),
    start_time_seconds: z.number().gte(0).optional(),
    end_time_seconds: z.number().gte(0).optional(),
  })
  .strict()
  .passthrough();
export const FileSegmentationConfig = z
  .object({
    segmentation_id: z.string().uuid(),
    segmentation_config: SegmentationConfig,
  })
  .partial()
  .strict()
  .passthrough();
export const File = z
  .object({
    id: z.string(),
    status: z.enum([
      "pending",
      "processing",
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
export const Segmentation = z
  .object({
    segmentation_id: z.string().uuid(),
    status: z.enum([
      "pending",
      "processing",
      "completed",
      "failed",
      "not_applicable",
    ]),
    created_at: z.number().gte(0),
    file_id: z.string().uuid(),
    segmentation_config: SegmentationConfig,
    total_segments: z.number().gte(0).optional(),
    data: z
      .object({
        object: z.literal("list"),
        segments: z.array(
          z
            .object({
              id: z.string().uuid(),
              start_time: z.number(),
              end_time: z.number(),
            })
            .strict()
            .passthrough()
        ),
        total: z.number().int(),
        limit: z.number().int(),
        offset: z.number().int(),
      })
      .strict()
      .passthrough()
      .optional(),
  })
  .strict()
  .passthrough();
