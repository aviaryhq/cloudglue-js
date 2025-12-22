import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

import { FaceBoundingBox } from './common';
import { FrameExtractionConfig } from './common';
import { FrameExtractionUniformConfig } from './common';
import { FrameExtractionThumbnailsConfig } from './common';
import { PaginationResponse } from './common';

type FaceDetection = {
  face_detection_id: string;
  frame_extraction_id?: string | undefined;
  file_id?: string | undefined;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: number;
  data?:
    | Partial<{
        object: 'list';
        total: number;
        limit: number;
        offset: number;
        faces: Array<DetectedFace>;
      }>
    | undefined;
};
type FaceDetectionRequest = {
  url: string;
  frame_extraction_id?: string | undefined;
  frame_extraction_config?: FrameExtractionConfig | undefined;
};
type DetectedFace = {
  id: string;
  face_bounding_box: FaceBoundingBox;
  frame_id: string;
  timestamp: number;
  thumbnail_url?: string | undefined;
};
type FaceDetectionListResponse = PaginationResponse &
  Partial<{
    data: Array<{
      job_id: string;
      frame_extraction_id?: string | undefined;
      file_id?: string | undefined;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      created_at: number;
      total_faces?: number | undefined;
    }>;
  }>;

const FaceDetectionRequest: z.ZodType<FaceDetectionRequest> = z
  .object({
    url: z.string(),
    frame_extraction_id: z.string().uuid().optional(),
    frame_extraction_config: FrameExtractionConfig.optional(),
  })
  .strict()
  .passthrough();
const DetectedFace: z.ZodType<DetectedFace> = z
  .object({
    id: z.string().uuid(),
    face_bounding_box: FaceBoundingBox,
    frame_id: z.string().uuid(),
    timestamp: z.number(),
    thumbnail_url: z.string().optional(),
  })
  .strict()
  .passthrough();
const FaceDetection: z.ZodType<FaceDetection> = z
  .object({
    face_detection_id: z.string().uuid(),
    frame_extraction_id: z.string().uuid().optional(),
    file_id: z.string().uuid().optional(),
    status: z.enum(['pending', 'processing', 'completed', 'failed']),
    created_at: z.number(),
    data: z
      .object({
        object: z.literal('list'),
        total: z.number().int(),
        limit: z.number().int().gte(1).lte(100),
        offset: z.number().int().gte(0),
        faces: z.array(DetectedFace),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
  })
  .strict()
  .passthrough();
const FaceDetectionListResponse: z.ZodType<FaceDetectionListResponse> =
  PaginationResponse.and(
    z
      .object({
        data: z.array(
          z
            .object({
              job_id: z.string().uuid(),
              frame_extraction_id: z.string().uuid().optional(),
              file_id: z.string().uuid().optional(),
              status: z.enum(['pending', 'processing', 'completed', 'failed']),
              created_at: z.number(),
              total_faces: z.number().int().optional(),
            })
            .strict()
            .passthrough()
        ),
      })
      .partial()
      .strict()
      .passthrough()
  );

export const schemas = {
  FaceDetectionRequest,
  DetectedFace,
  FaceDetection,
  FaceDetectionListResponse,
};

const endpoints = makeApi([
  {
    method: 'post',
    path: '/face-detect',
    alias: 'createFaceDetection',
    description: `Analyze video to detect all faces`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Face detection request parameters`,
        type: 'Body',
        schema: FaceDetectionRequest,
      },
    ],
    response: FaceDetection,
    errors: [
      {
        status: 400,
        description: `Invalid request parameters or configuration`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Target video file not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 429,
        description: `Monthly face detection jobs limit reached`,
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
    path: '/face-detect',
    alias: 'listFaceDetection',
    description: `List all face detection jobs`,
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
    ],
    response: FaceDetectionListResponse,
  },
  {
    method: 'get',
    path: '/face-detect/:face_detection_id',
    alias: 'getFaceDetection',
    description: `Retrieve face detection results including all detected faces`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'face_detection_id',
        type: 'Path',
        schema: z.string().uuid(),
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
    ],
    response: FaceDetection,
    errors: [
      {
        status: 404,
        description: `Face detection job not found`,
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
    path: '/face-detect/:face_detection_id',
    alias: 'deleteFaceDetection',
    description: `Delete a specific face detection analysis`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'face_detection_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: z.object({ id: z.string().uuid() }).strict().passthrough(),
    errors: [
      {
        status: 404,
        description: `Face detection job not found`,
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

export const Face_DetectionApi = new Zodios(
  'https://api.cloudglue.dev/v1',
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
