const rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const withApi = /\/api\b/.test(rawBase) ? rawBase : `${rawBase}/api`;

export const apiBase = withApi.endsWith("/")
  ? withApi.slice(0, -1)
  : withApi;
