/**
 * Storage abstraction layer.
 *
 * Uses localStorage with JSON serialization.
 * All keys are prefixed with 'ledger:' to avoid collisions.
 *
 * To migrate to a REST backend, replace the four functions below
 * with fetch('/api/...') calls — nothing else in the app changes.
 *
 * Expected backend shape:
 *   GET  /api/store/:key        → { value: any }
 *   PUT  /api/store/:key        body: { value: any }
 *   DELETE /api/store/:key
 *   GET  /api/store             → { keys: string[] }
 */

const PREFIX = 'ledger:';

export async function sGet(k) {
    try {
        const raw = localStorage.getItem(PREFIX + k);
        if (raw === null) return null;
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

export async function sSet(k, v) {
    try {
        localStorage.setItem(PREFIX + k, JSON.stringify(v));
    } catch (e) {
        console.error('storage.set failed for key:', k, e);
    }
}

export async function sDel(k) {
    try {
        localStorage.removeItem(PREFIX + k);
    } catch (e) {
        /* ignore */
    }
}

export async function sListKeys() {
    try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const raw = localStorage.key(i);
            if (raw && raw.startsWith(PREFIX)) {
                keys.push(raw.slice(PREFIX.length));
            }
        }
        return keys;
    } catch (e) {
        return [];
    }
}
