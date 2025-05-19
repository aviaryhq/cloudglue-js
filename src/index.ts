/**
 * Main CloudGlue client class and configuration types
 */
export { CloudGlue, type CloudGlueConfig , type CloudGlueError} from './client';

/**
 * Generated API clients for advanced usage
 * These provide direct access to the underlying API endpoints
 */
export {
  FilesApi,
  CollectionsApi,
  ChatApi,
  TranscribeApi,
  ExtractApi
} from '../generated';

/**
 * Common type definitions used throughout the SDK
 */
export type {
  File,
  Collection,
  CollectionFile,
  CollectionFileList,
  ChatMessage,
  ChatCompletionResponse,
  Transcribe,
  TranscribeList,
  Extract,
  ExtractList,
  EntitySegment,
  CollectionVideoEntities,
  NewCollectionParams,
} from './types';
