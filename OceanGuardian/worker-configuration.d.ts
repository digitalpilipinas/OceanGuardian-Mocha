// Worker configuration type definitions for Cloudflare Workers

// Cloudflare Worker global APIs that are available at runtime
// but not in the default TS lib (since lib is set to ESNext, not webworker)
declare function fetch(input: string | Request, init?: RequestInit): Promise<Response>;

// Minimal R2 types used by the worker (only if not provided by @cloudflare/workers-types)
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
    RESEND_API_KEY: string;
    R2_BUCKET: R2Bucket;
}
