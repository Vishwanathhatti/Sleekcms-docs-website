type Entry = Record<string, unknown>;
type Page = {
    _path: string;
    [key: string]: unknown;
};
type Image = {
    url: string;
    [key: string]: unknown;
};
type Options = Array<{
    label: string;
    value: string;
}>;
interface SleekSiteContent {
    entries?: {
        [handle: string]: Entry | Entry[];
    };
    pages?: Array<Page>;
    images?: Record<string, Image>;
    options?: Record<string, Options>;
    config?: {
        title?: string;
    };
}
interface SyncCacheAdapter {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}
interface AsyncCacheAdapter {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
}
interface ClientOptions {
    siteToken: string;
    env?: string;
    resolveEnv?: boolean;
    lang?: string;
    cache?: SyncCacheAdapter | AsyncCacheAdapter;
    cacheMinutes?: number;
}
interface SleekClient {
    getContent(query?: string): SleekSiteContent;
    getPages(path: string): SleekSiteContent["pages"];
    getPage(path: string): Page | null;
    getEntry(handle: string): Entry | Entry[] | null;
    getSlugs(path: string): string[];
    getImage(name: string): Image | null;
    getOptions(name: string): Options | null;
}
interface SleekAsyncClient {
    getContent(query?: string): Promise<SleekSiteContent>;
    getPages(path: string): Promise<SleekSiteContent["pages"]>;
    getPage(path: string): Promise<Page | null>;
    getEntry(handle: string): Promise<Entry | Entry[] | null>;
    getSlugs(path: string): Promise<string[]>;
    getImage(name: string): Promise<Image | null>;
    getOptions(name: string): Promise<Options | null>;
    _getFetchUrl(): string;
    _getEnvTag(): Promise<string>;
}

declare function createSyncClient(options: ClientOptions): Promise<SleekClient>;
declare function createAsyncClient(options: ClientOptions): SleekAsyncClient | any;

export { type AsyncCacheAdapter, type ClientOptions, type Entry, type Image, type Options, type Page, type SleekAsyncClient, type SleekClient, type SleekSiteContent, type SyncCacheAdapter, createAsyncClient, createSyncClient };
