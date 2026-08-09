// path: services/config.ts
export const API_BASE_URL = "http://localhost:8000";

export const backendPath = (path: string) => `${API_BASE_URL}${path}`;