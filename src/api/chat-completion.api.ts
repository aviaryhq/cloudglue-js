import { ChatApi } from '../../generated';
import { CloudGlueError } from '../error';
import { schemas as chatSchemas } from '../../generated/Chat';
import z from 'zod';

export class EnhancedChatApi {
  constructor(private readonly api: typeof ChatApi) {}

  async createCompletion({
    model = 'nimbus-001',
    ...params
  }: z.infer<typeof chatSchemas.ChatCompletionRequest>) {
    return this.api.createCompletion({
      model,
      ...params,
    });
  }
}
