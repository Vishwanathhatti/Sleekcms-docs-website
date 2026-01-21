# Custom SleekCMS Client (`lib/sleekcms-client.js`)

## Overview
This project uses a **local, patched version** of the `@sleekcms/client` library instead of the standard node_modules package. This file is located at `lib/sleekcms-client.js`.

**Base Version:** `@sleekcms/client` v3.1.0

## Reason for Fork
The standard `@sleekcms/client` library implements an internal module-level cache (`envTagCache`) for the environment version tag. This cache persists for the lifetime of the application process.

In a Next.js environment (especially during development), this caused an issue where content updates were ignored because the client would indefinitely use the cached "latest" version tag fetched at startup, rather than checking for a new version.

## The Patch
We modified the `fetchSiteContent` function in `lib/sleekcms-client.js` to bypass this internal environment tag cache.

**Original Code:**
```javascript
if (resolveEnv) {
  const cacheKey2 = `${siteToken}:${env}`;
  let tag = envTagCache.get(cacheKey2); // Reads from cache
  // ...
}
```

**Patched Code:**
```javascript
if (resolveEnv) {
  const cacheKey2 = `${siteToken}:${env}`;
  // let tag = envTagCache.get(cacheKey2); // PATCH: Disable env tag cache read
  let tag = undefined; // Force tag to be undefined to trigger a fresh fetch
  // ...
}
```

This change forces the client to resolve the latest environment tag from the SleekCMS API on **every request**, ensuring that content updates (live edits) are immediately reflected in the application without requiring a server restart.

## Usage
The application imports this custom client in `lib/sleekcms.ts`:

```typescript
// Imports from local patched file instead of @sleekcms/client
import { createAsyncClient } from './sleekcms-client'

export function cmsClient() {
  return createAsyncClient({
    // ...
    resolveEnv: true,
    env: "latest",
    cacheMinutes: 0,
  })
}
```
