import createClient from "openapi-fetch";
import type { paths } from "./schema";

/**
 * API client configuration
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Type-safe API client generated from OpenAPI schema
 *
 * This client provides full TypeScript support for all API endpoints,
 * including request/response types, path parameters, and query strings.
 */
export const apiClient = createClient<paths>({
  baseUrl: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * API endpoints type-safe reference
 */
export type ApiPaths = paths;
