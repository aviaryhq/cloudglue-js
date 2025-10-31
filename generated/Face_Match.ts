import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { FaceBoundingBox } from "./common";
import { FrameExtractionConfig } from "./common";
import { FrameExtractionUniformConfig } from "./common";
import { FrameExtractionThumbnailsConfig } from "./common";

type FaceMatch = {
  face_match_id: string;
  face_detection_id?: string | undefined;
  frame_extraction_id?: string | undefined;
  file_id?: string | undefined;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: number;
  source_face_bounding_box?: (FaceBoundingBox | null) | undefined;
  data?:
    | Partial<{
        object: "list";
        total: number;
        limit: number;
        offset: number;
        faces_matches: Array<FaceMatchResult>;
      }>
    | undefined;
};
type FaceMatchRequest = {
  source_image: SourceImage;
  target_video_url: string;
  max_faces?: number | undefined;
  face_detection_id?: string | undefined;
  frame_extraction_id?: string | undefined;
  frame_extraction_config?: FrameExtractionConfig | undefined;
};
type FaceMatchResult = {
  id: string;
  face_bounding_box: FaceBoundingBox;
  similarity: number;
  frame_id: string;
  timestamp: number;
  thumbnail_url?: string | undefined;
};
type SourceImage = Partial<{
  url: string;
  base64_image: string;
}>;

const SourceImage: z.ZodType<SourceImage> = z
  .object({ url: z.string(), base64_image: z.string() })
  .partial()
  .strict()
  .passthrough();
const FaceMatchRequest: z.ZodType<FaceMatchRequest> = z
  .object({
    source_image: SourceImage,
    target_video_url: z.string(),
    max_faces: z.number().int().gte(1).lte(4000).optional().default(50),
    face_detection_id: z.string().uuid().optional(),
    frame_extraction_id: z.string().uuid().optional(),
    frame_extraction_config: FrameExtractionConfig.optional(),
  })
  .strict()
  .passthrough();
const FaceMatchResult: z.ZodType<FaceMatchResult> = z
  .object({
    id: z.string().uuid(),
    face_bounding_box: FaceBoundingBox,
    similarity: z.number().gte(0).lte(100),
    frame_id: z.string().uuid(),
    timestamp: z.number(),
    thumbnail_url: z.string().optional(),
  })
  .strict()
  .passthrough();
const FaceMatch: z.ZodType<FaceMatch> = z
  .object({
    face_match_id: z.string().uuid(),
    face_detection_id: z.string().uuid().optional(),
    frame_extraction_id: z.string().uuid().optional(),
    file_id: z.string().uuid().optional(),
    status: z.enum(["pending", "processing", "completed", "failed"]),
    created_at: z.number(),
    source_face_bounding_box: FaceBoundingBox.nullish(),
    data: z
      .object({
        object: z.literal("list"),
        total: z.number().int(),
        limit: z.number().int().gte(1).lte(100),
        offset: z.number().int().gte(0),
        faces_matches: z.array(FaceMatchResult),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
  })
  .strict()
  .passthrough();

export const schemas = {
  SourceImage,
  FaceMatchRequest,
  FaceMatchResult,
  FaceMatch,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/face-match",
    alias: "createFaceMatch",
    description: `Search for a source face in a target video using facial recognition`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Face match request parameters`,
        type: "Body",
        schema: FaceMatchRequest,
      },
    ],
    response: FaceMatch,
    errors: [
      {
        status: 400,
        description: `Invalid request parameters or source image`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Target video file not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 429,
        description: `Monthly face match jobs limit reached`,
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
    path: "/face-match/:face_match_id",
    alias: "getFaceMatch",
    description: `Retrieve face match results including detected faces and similarity scores`,
    requestFormat: "json",
    parameters: [
      {
        name: "face_match_id",
        type: "Path",
        schema: z.string().uuid(),
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
    response: FaceMatch,
    errors: [
      {
        status: 404,
        description: `Face match job not found`,
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
    path: "/face-match/:face_match_id",
    alias: "deleteFaceMatch",
    description: `Delete a specific face match analysis`,
    requestFormat: "json",
    parameters: [
      {
        name: "face_match_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        face_match_id: z.string().uuid(),
        object: z.literal("face_match"),
      })
      .strict()
      .passthrough(),
    errors: [
      {
        status: 404,
        description: `Face match job not found`,
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

export const Face_MatchApi = new Zodios(
  "https://api.cloudglue.dev/v1",
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
