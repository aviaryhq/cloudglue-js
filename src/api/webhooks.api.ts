import { WebhooksApi } from "../../generated";
import { WebhookEvents } from "../types";

export class EnhancedWebhooksApi { 
  constructor(private readonly api: typeof WebhooksApi) {}
  async listWebhooks(params: {
    limit?: number;
    offset?: number;
    sort?: "asc" | "desc";
  } = {}) {
    return this.api.listWebhooks({ queries: params });
  }

  async getWebhook(webhookId: string) {
    return this.api.getWebhookById({ params: { webhook_id: webhookId } });
  }

  async createWebhook(params: {
    endpoint: string;
    description?: string;
    subscribed_events?: WebhookEvents[];
  }) {
    return this.api.createWebhook(params);
  }

  async updateWebhook(webhookId: string, params: {
    endpoint: string;
    description?: string;
    subscribed_events?: WebhookEvents[];
    active?: boolean;
  }) {
    return this.api.updateWebhook(params, { params: { webhook_id: webhookId, } });
  }

  async deleteWebhook(webhookId: string) {
    return this.api.deleteWebhook(undefined, { params: { webhook_id: webhookId } });
  }
}