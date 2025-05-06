# CloudGlue JavaScript SDK

[![NPM Version](https://img.shields.io/npm/v/%40aviaryhq%2Fcloudglue-js)](https://www.npmjs.com/package/@aviaryhq/cloudglue-js) 
[![License](https://img.shields.io/badge/License-ELv2-blue.svg)](LICENSE.md)
[![Discord](https://img.shields.io/discord/1366541583272382536?logo=discord&label=Discord)](https://discord.gg/QD5KWFVner)

CloudGlue makes it easy to turn video into LLM ready data. Official JavaScript SDK for the CloudGlue API. 

## 📖 Resources

- [CloudGlue API Docs](https://docs.cloudglue.dev)
- [Terms of Service](https://cloudglue.dev/terms)
- [Privacy Policy](https://cloudglue.dev/privacy)
- [Pricing](https://cloudglue.dev/pricing)

> By using this SDK, you agree to the [CloudGlue Terms of Service](https://cloudglue.dev/terms) and acknowledge our [Privacy Policy](https://cloudglue.dev/privacy).

## Installation

```bash
npm install @aviaryhq/cloudglue-js
```

## Quick Start

```typescript
import { CloudGlue } from '@aviaryhq/cloudglue-js';

// Initialize the client
const client = new CloudGlue({
  apiKey: process.env.CLOUDGLUE_API_KEY
});

// List your video files
const response = await client.files.listFiles({ limit: 10 });

// Chat with a collection
const chatResponse = await client.chat.createCompletion({
  model: 'nimbus-001',
  messages: [
    { role: 'user', content: 'What are the key points discussed in these videos?' }
  ],
  // Assumes collection already exists, otherwise create one first then reference here by collection id 
  collections: ['your_collection_id'],
  include_citations: true,
  force_search: true
});
```

## Configuration

The `CloudGlue` client accepts the following configuration options:

```typescript
interface CloudGlueConfig {
  apiKey?: string;      // Your API key (can also use CLOUDGLUE_API_KEY env var)
  baseUrl?: string;     // Optional custom base URL
}
```

## Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Git (for spec submodule)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/aviaryhq/cloudglue-js.git
cd cloudglue-js
```

2. Initialize the spec submodule:
```bash
make submodule-init
```

3. Install dependencies:
```bash
npm install
```

4. Generate API clients:
```bash
npm run generate
```

### Available Commands

- `make submodule-init`: Initialize the OpenAPI spec submodule
- `make submodule-update`: Update the OpenAPI spec submodule
- `npm run generate`: Generate API clients from the spec
- `npm run build`: Build the package
- `npm run clean`: Clean build artifacts
- `npm run prepare`: Build the package (used by npm)
- `npm run watch`: Watch for changes and rebuild automatically (development)

### Building

```bash
npm run build
```

This will:
1. Clean the previous build
2. Compile TypeScript files

## Contact

* [Open an Issue](https://github.com/aviaryhq/cloudglue-js/issues/new)
* [Email](mailto:support@cloudglue.dev)

