// Worker configuration type definitions for Cloudflare Workers
// These types are needed because @cloudflare/workers-types cannot be installed
// due to vite version conflicts. The Cloudflare Vite plugin handles runtime
// types at build time, but tsc needs these for type-checking.

// Cloudflare Worker global APIs that are available at runtime
// but not in the default TS lib (since lib is set to ESNext, not webworker)
declare function fetch(input: string | Request, init?: RequestInit): Promise<Response>;

declare class Headers {
    constructor(init?: HeadersInit);
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    has(name: string): boolean;
    set(name: string, value: string): void;
    forEach(callback: (value: string, key: string, parent: Headers) => void): void;
    entries(): IterableIterator<[string, string]>;
    keys(): IterableIterator<string>;
    values(): IterableIterator<string>;
}

declare class File extends Blob {
    constructor(bits: BlobPart[], name: string, options?: FilePropertyBag);
    readonly name: string;
    readonly lastModified: number;
    readonly type: string;
    readonly size: number;
}

// Minimal R2 types used by the worker
interface R2Bucket {
    put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob, options?: Record<string, unknown>): Promise<R2Object | null>;
    get(key: string): Promise<R2ObjectBody | null>;
    delete(key: string | string[]): Promise<void>;
}

interface R2Object {
    key: string;
    size: number;
    httpEtag: string;
    httpMetadata?: Record<string, string>;
    writeHttpMetadata(headers: Headers): void;
}

interface R2ObjectBody extends R2Object {
    body: ReadableStream;
    bodyUsed: boolean;
    arrayBuffer(): Promise<ArrayBuffer>;
    text(): Promise<string>;
    json<T = unknown>(): Promise<T>;
    blob(): Promise<Blob>;
}

// Environment bindings
interface Env {
    TURSO_DB_URL: string;
    TURSO_DB_AUTH_TOKEN: string;
    MOCHA_USERS_SERVICE_API_URL: string;
    MOCHA_USERS_SERVICE_API_KEY: string;
    MOCHA_APP_ID: string;
    R2_BUCKET: R2Bucket;
    EMAILS: {
        send(message: {
            to: string;
            from: string;
            subject: string;
            content: { type: string; value: string }[];
        }): Promise<void>;
    };
}
