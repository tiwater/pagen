// Simple in-memory store for preview components
const store = new Map<string, string>();

export function setPreview(id: string, code: string) {
    store.set(id, code);
}

export function getPreview(id: string): string | undefined {
    return store.get(id);
}
