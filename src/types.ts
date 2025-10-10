import type { z } from 'zod';

// Import schemas from generated files
import { schemas as collectionsSchemas } from '../generated/Collections';
import { schemas as chatSchemas } from '../generated/Chat';
import { schemas as transcribeSchemas } from '../generated/Transcribe';
import { schemas as extractSchemas } from '../generated/Extract';
import { schemas as searchSchemas } from '../generated/Search';
import { schemas as describeSchemas } from '../generated/Describe';
import { schemas as segmentsSchemas } from '../generated/Segments';
import { SegmentationUniformConfig as SegmentationUniformConfigType, SegmentationShotDetectorConfig as SegmentationShotDetectorConfigType, SegmentationConfig as SegmentationConfigType } from '../generated/common';
import { schemas as webhooksSchemas } from '../generated/Webhooks';

/**
 * Represents a video file in the Cloudglue system
 * Contains metadata about the file including its status, size, and video information
 */
export type { File } from '../generated/common';


/**
 * Represents the status of a job
 * TODO: would be better to use a common type for all jobs
 */
export type JobStatus = z.infer<typeof transcribeSchemas.Transcribe>['status'];

/**
 * Parameters for updating an existing file
 */
export interface UpdateFileParams {
  filename?: string;
  metadata?: Record<string, any>;
  // Index signature allows additional properties to match the generated schema's .passthrough() behavior
  // [key: string]: any;
}

/**
 * Parameters for creating a new collection
 */
export type NewCollectionParams = z.infer<typeof collectionsSchemas.NewCollection>;

/**
 * Represents a collection of videos
 * Contains metadata about the collection and its configuration
 */
export type Collection = z.infer<typeof collectionsSchemas.Collection>;

/**
 * Represents a video file within a collection
 * Contains metadata about the file and its processing status within the collection
 */
export type CollectionFile = z.infer<typeof collectionsSchemas.CollectionFile>;


/**
 * Represents a paginated list of files within a collection
 */
export type CollectionFileList = z.infer<typeof collectionsSchemas.CollectionFileList>;


/**
 * Represents a segment of video with extracted entities
 * This is inferred from the FileEntities schema's segment_entities array type
 */
export type EntitySegment = NonNullable<z.infer<typeof collectionsSchemas.FileEntities>['segment_entities']>[number];

/**
 * Represents the full entities response for a video in a collection
 */
export type CollectionVideoEntities = z.infer<typeof collectionsSchemas.FileEntities>;

/**
 * Represents a message in a chat conversation
 * Used for interacting with videos through natural language
 */
export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
};

/**
 * Represents the response from a chat completion request
 * Contains the model's response and any relevant citations from videos
 */
export type ChatCompletionResponse = z.infer<typeof chatSchemas.ChatCompletionResponse>;

/**
 * Represents the result of a video transcription request
 * Contains detailed information about the video content including speech, text, and visual descriptions
 */
export type Transcribe = z.infer<typeof transcribeSchemas.Transcribe>;

/**
 * Represents a list of transcription jobs
 */
export type TranscribeList = z.infer<typeof transcribeSchemas.TranscribeList>;

/**
 * Represents the result of a video information extraction request
 * Contains structured data extracted from the video
 */
export type Extract = z.infer<typeof extractSchemas.Extract>;

/**
 * Represents a list of extraction jobs
 */
export type ExtractList = z.infer<typeof extractSchemas.ExtractList>; 

/**
 * Represents a rich transcript for a video
 */
export type RichTranscript = z.infer<typeof collectionsSchemas.RichTranscript>;

/**
 * Represents a list of entities for files in a collection
 */
export type CollectionEntitiesList = z.infer<typeof collectionsSchemas.CollectionEntitiesList>;

/**
 * Represents a list of rich transcripts for files in a collection
 */
export type CollectionRichTranscriptsList = z.infer<typeof collectionsSchemas.CollectionRichTranscriptsList>;

/**
 * Segmentation config for the Uniform strategy
 */
export type SegmentationUniformConfig = z.infer<typeof SegmentationUniformConfigType>;

/**
 * Segmentation config for the Shot Detector strategy
 */
export type SegmentationShotDetectorConfig = z.infer<typeof SegmentationShotDetectorConfigType>;
export type SegmentationConfig = z.infer<typeof SegmentationConfigType>;

/**
 * Represents a search request for finding videos or video segments
 */
export type SearchRequest = z.infer<typeof searchSchemas.SearchRequest>;

/**
 * Represents the response from a search request
 * Contains search results with file or segment matches
 */
export type SearchResponse = z.infer<typeof searchSchemas.SearchResponse>;

/**
 * Represents a file-level search result
 */
export type FileSearchResult = z.infer<typeof searchSchemas.FileSearchResult>;

/**
 * Represents a segment-level search result
 */
export type SegmentSearchResult = z.infer<typeof searchSchemas.SegmentSearchResult>;

/**
 * Represents search filter criteria for filtering results
 */
export type SearchFilterCriteria = z.infer<typeof searchSchemas.SearchFilterCriteria>;

/**
 * Represents search filter options for metadata, video info, and file properties
 */
export type SearchFilter = z.infer<typeof searchSchemas.SearchFilter>;

/**
 * Represents the result of a video description request
 * Contains detailed information about the video content including speech, text, and visual descriptions
 */
export type Describe = z.infer<typeof describeSchemas.Describe>;

/**
 * Represents a list of description jobs
 */
export type DescribeList = z.infer<typeof describeSchemas.DescribeList>;

/**
 * Represents media description data for a video in a collection
 */
export type CollectionMediaDescription = z.infer<typeof collectionsSchemas.MediaDescription>;

/**
 * Represents a list of media descriptions for files in a collection
 */
export type CollectionMediaDescriptionsList = z.infer<typeof collectionsSchemas.CollectionMediaDescriptionsList>;

export type NarrativeConfig = z.infer<typeof segmentsSchemas.NarrativeConfig>;

export type ShotConfig = z.infer<typeof segmentsSchemas.ShotConfig>;

export type WebhookEvents = z.infer<typeof webhooksSchemas['WebhookEvents']>;
