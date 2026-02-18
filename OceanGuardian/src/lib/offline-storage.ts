
const DB_NAME = "OceanGuardianDB";
const STORE_NAME = "pending_sightings";
const USER_ID_INDEX = "by_user_id";
const DB_VERSION = 2;

export interface SightingData {
    id: string; // UUID
    userId: string;
    timestamp: number;
    type: string;
    subcategory: string;
    description: string;
    severity: number;
    location: string;
    latitude: number;
    longitude: number;
    waterTemp?: string; // stored as string in form, parsed later
    bleachPercent?: string;
    depth?: string;
    photoBlob?: Blob | null; // The compressed image
    imageKey?: string | null; // R2 key from pre-upload flows like Coral Scan
    aiAnalysis?: string;
    serverSightingId?: number | null; // Assigned once the backend sighting row exists
    attemptCount?: number;
    lastAttemptAt?: number;
    lastError?: string;
}

export const offlineStorage = {
    async openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                let store: IDBObjectStore;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
                } else {
                    store = (event.target as IDBOpenDBRequest).transaction!.objectStore(STORE_NAME);
                }

                if (!store.indexNames.contains(USER_ID_INDEX)) {
                    store.createIndex(USER_ID_INDEX, "userId", { unique: false });
                }
            };
        });
    },

    async saveSighting(data: SightingData): Promise<void> {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(data);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async getPendingSightings(userId: string): Promise<SightingData[]> {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.index(USER_ID_INDEX).getAll(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async removeSighting(id: string): Promise<void> {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },
};
