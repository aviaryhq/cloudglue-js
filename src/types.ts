import type { z } from 'zod';

// Import schemas from generated files
import { schemas as collectionsSchemas } from '../generated/Collections';
import { schemas as chatSchemas } from '../generated/Chat';
import { schemas as transcribeSchemas } from '../generated/Transcribe';
import { schemas as extractSchemas } from '../generated/Extract';

/**
 * Represents a video file in the CloudGlue system
 * Contains metadata about the file including its status, size, and video information
 */
export type { File } from '../generated/common';

/**
 * Parameters for updating an existing file
 */
export interface UpdateFileParams {
  filename?: string;
  metadata?: Record<string, any>;
  // Index signature allows additional properties to match the generated schema's .passthrough() behavior
  [key: string]: any;
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


