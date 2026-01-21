// src/lib.ts
import * as jmespath from "jmespath";
var envTagCache = /* @__PURE__ */ new Map();
function getBaseUrl(token, devEnv) {
    let [env, siteId, ...rest] = token.split("-");
    if (devEnv === "production") return `https://pub.sleekcms.com/${siteId}`;
    else if (devEnv === "development") return `https://pub.sleekcms.net/${siteId}`;
    else if (devEnv === "localhost") return `http://localhost:9001/localhost/${siteId}`;
    else throw new Error(`[SleekCMS] Unknown devEnv: ${devEnv}`);
}
function applyJmes(data, query) {
    if (!query) return data;
    return jmespath.search(data, query);
}
function getUrl({ siteToken, env, search: search2, lang, devEnv = "production" }) {
    const baseUrl = getBaseUrl(siteToken, devEnv).replace(/\/$/, "");
    const url = new URL(`${baseUrl}/${env ?? "latest"}`);
    if (search2) url.searchParams.append("search", search2);
    if (lang) url.searchParams.append("lang", lang);
    return url.toString();
}
async function fetchEnvTag({ siteToken, env }) {
    const url = getUrl({ siteToken, env });
    try {
        let res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: siteToken
            }
        });
        if (res.ok) {
            let data = await res.json();
            if (data.tag) {
                return data.tag;
            }
        }
    } catch (e) {
        console.error("[SleekCMS] Unable to resolve env tag.");
    }
    return env;
}
async function fetchSiteContent(options) {
    const { siteToken, env = "latest", resolveEnv = false, search: search2, lang, cache, cacheMinutes } = options;
    let url = getUrl({ siteToken, env, search: search2, lang });
    if (resolveEnv) {
        const cacheKey2 = `${siteToken}:${env}`;
        // let tag = envTagCache.get(cacheKey2); // PATCH: Disable env tag cache read to ensure freshness
        let tag = undefined;
        try {
            if (!tag) {
                tag = await fetchEnvTag({ siteToken, env });
                envTagCache.set(cacheKey2, tag);
            }
            url = getUrl({ siteToken, env: tag, search: search2, lang });
        } catch (error) {
            console.warn("[SleekCMS] Failed to resolve env tag, using cached content instead.");
        }
    }
    const cacheKey = url;
    const fetchAndCache = async () => {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: siteToken
            }
        });
        if (!res.ok) {
            let message = res.statusText;
            try {
                const data2 = await res.json();
                if (data2 && data2.message) message = data2.message;
            } catch {
            }
            throw new Error(`[SleekCMS] Request failed (${res.status}): ${message}`);
        }
        const data = await res.json();
        if (cache) {
            try {
                const cacheData = { data, _ts: Date.now() };
                await Promise.resolve(cache.setItem(cacheKey, JSON.stringify(cacheData)));
            } catch (e) {
                console.warn("[SleekCMS] Cache write failed:", e);
            }
        }
        return data;
    };
    if (cache) {
        try {
            const cached = await Promise.resolve(cache.getItem(cacheKey));
            if (cached) {
                try {
                    const cachedData = JSON.parse(cached);
                    if (cachedData._ts !== void 0) {
                        if (cacheMinutes) {
                            const now = Date.now();
                            const expiryMs = cacheMinutes * 60 * 1e3;
                            const age = now - cachedData._ts;
                            if (age >= expiryMs) {
                                try {
                                    return await fetchAndCache();
                                } catch (error) {
                                    console.warn("[SleekCMS] Fetch failed, using expired cache:", error);
                                }
                            }
                        }
                        return cachedData.data;
                    } else {
                        return cachedData;
                    }
                } catch (e) {
                }
            }
        } catch (e) {
            console.warn("[SleekCMS] Cache read failed:", e);
        }
    }
    return await fetchAndCache();
}
function extractSlugs(pages, path) {
    const slugs = [];
    const pagesList = pages ?? [];
    for (const page of pagesList) {
        const pth = typeof page._path === "string" ? page._path : "";
        if (pth.startsWith(path) && "_slug" in page && typeof page._slug === "string") {
            slugs.push(page._slug);
        }
    }
    return slugs;
}
function filterPagesByPath(pages, path) {
    const pagesList = pages ?? [];
    return pagesList.filter((p) => {
        const pth = typeof p._path === "string" ? p._path : "";
        return pth.startsWith(path);
    });
}

// src/index.ts
var MemoryCache = class {
    cache = /* @__PURE__ */ new Map();
    getItem(key) {
        return this.cache.get(key) ?? null;
    }
    setItem(key, value) {
        this.cache.set(key, value);
    }
};
async function createSyncClient(options) {
    const cache = options.cache ?? new MemoryCache();
    const data = await fetchSiteContent({ ...options, cache });
    function getContent(query) {
        return applyJmes(data, query);
    }
    function getPages(path) {
        if (!path) {
            throw new Error("[SleekCMS] path is required for getPages");
        }
        return filterPagesByPath(data.pages, path);
    }
    function getPage(path) {
        if (!path) {
            throw new Error("[SleekCMS] path is required for getPage");
        }
        const pages = data.pages ?? [];
        const page = pages.find((p) => {
            const pth = typeof p._path === "string" ? p._path : "";
            return pth === path;
        });
        return page ?? null;
    }
    function getEntry(handle) {
        if (!handle) {
            throw new Error("[SleekCMS] handle is required for getEntry");
        }
        const entries = data.entries ?? {};
        const entry = entries[handle] ?? null;
        return entry;
    }
    function getSlugs(path) {
        if (!path) {
            throw new Error("[SleekCMS] path is required for getSlugs");
        }
        return extractSlugs(data.pages, path);
    }
    function getImage(name) {
        if (!name) return null;
        return data.images ? data.images[name] : null;
    }
    function getOptions(name) {
        if (!name) return null;
        const options2 = data.options ?? {};
        const optionSet = options2[name];
        return Array.isArray(optionSet) ? optionSet : null;
    }
    return {
        getContent,
        getPages,
        getPage,
        getEntry,
        getSlugs,
        getImage,
        getOptions
    };
}
function createAsyncClient(options) {
    const { siteToken, env = "latest", resolveEnv, lang } = options;
    const cache = options.cache ?? new MemoryCache();
    let syncClient = null;
    async function getContent(search2) {
        if (!search2 && !syncClient) {
            syncClient = await createSyncClient({ siteToken, env, resolveEnv, lang, cache });
        }
        if (syncClient) return syncClient.getContent(search2);
        if (!search2) return null;
        return await fetchSiteContent({ siteToken, env, search: search2, lang, cache, resolveEnv });
    }
    async function getPages(path) {
        if (syncClient) return syncClient.getPages(path);
        const pages = await fetchSiteContent({ siteToken, env, search: "pages", lang, cache, resolveEnv });
        if (!path) return pages;
        else return filterPagesByPath(pages, path);
    }
    async function getPage(path) {
        if (syncClient) return syncClient.getPage(path);
        const pages = await fetchSiteContent({ siteToken, env, search: "pages", lang, cache, resolveEnv });
        const page = pages == null ? void 0 : pages.find((p) => {
            const pth = typeof p._path === "string" ? p._path : "";
            return pth === path;
        });
        return page ?? null;
    }
    async function getEntry(handle) {
        if (syncClient) return syncClient.getEntry(handle);
        let search2 = `entries.${handle}`;
        return await fetchSiteContent({ siteToken, env, search: search2, lang, cache, resolveEnv });
    }
    async function getSlugs(path) {
        if (syncClient) return syncClient.getSlugs(path);
        const pages = await fetchSiteContent({ siteToken, env, search: "pages", lang, cache, resolveEnv });
        return extractSlugs(pages, path);
    }
    async function getImage(name) {
        if (syncClient) return syncClient.getImage(name);
        const images = await fetchSiteContent({ siteToken, env, search: "images", lang, cache, resolveEnv });
        return images ? images[name] : null;
    }
    async function getOptions(name) {
        if (syncClient) return syncClient.getOptions(name);
        const options2 = await fetchSiteContent({ siteToken, env, search: "options", lang, cache, resolveEnv });
        const optionSet = options2[name];
        return Array.isArray(optionSet) ? optionSet : null;
    }
    async function _getEnvTag() {
        let resp = await fetchEnvTag({ siteToken, env });
        return resp;
    }
    function _getFetchUrl() {
        return getUrl(options);
    }
    return {
        getContent,
        getPages,
        getPage,
        getEntry,
        getSlugs,
        getImage,
        getOptions,
        _getFetchUrl,
        _getEnvTag
    };
}
export {
    createAsyncClient,
    createSyncClient
};
