// path: services/config.ts
export const API_BASE_URL = "https://18-204-12-4.sslip.io";

export const backendPath = (path: string) => `${API_BASE_URL}${path}`;
