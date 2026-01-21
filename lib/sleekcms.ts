import { createAsyncClient } from './sleekcms-client'

export function cmsClient() {
  return createAsyncClient({
    siteToken: process.env.NEXT_PUBLIC_SLEEK_TOKEN || "", // OK to publicly expose
    resolveEnv: true,
    env: "latest",
    cacheMinutes: 0,
  })
}
