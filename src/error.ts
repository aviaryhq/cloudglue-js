export class CloudGlueError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly data?: string,
    public readonly headers?: Record<string, any>,
    public readonly responseData?: any,
  ) {
    super(message);
    this.name = 'CloudGlueError';
  }
}
