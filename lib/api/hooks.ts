import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { paths } from "./schema";

/**
 * Type definitions for API requests and responses (strictly from OpenAPI schema)
 */
type ResearchRequest = paths["/research"]["post"]["parameters"]["body"];
type ResearchResponse =
  paths["/research"]["post"]["responses"][200]["content"]["application/json"];
type DeepResearchResponse =
  paths["/deep-research"]["post"]["responses"][200]["content"]["application/json"];
type MultiAgentResearchResponse =
  paths["/multi-agent-research"]["post"]["responses"][200]["content"]["application/json"];

/**
 * Hook for basic research endpoint
 *
 * @example
 * ```tsx
 * const research = useResearch();
 *
 * research.mutate({ query: "What is quantum computing?" }, {
 *   onSuccess: (data) => console.log(data),
 *   onError: (error) => console.error(error)
 * });
 * ```
 */
export function useResearch(
  options?: UseMutationOptions<ResearchResponse, Error, ResearchRequest>
) {
  return useMutation({
    mutationFn: async (request: ResearchRequest) => {
      const { data, error } = await apiClient.POST("/research", {
        params: { body: request },
      });

      if (error) {
        const message =
          (error as { detail?: string }).detail ||
          (error as { message?: string }).message ||
          "Research failed";
        throw new Error(message);
      }

      return data;
    },
    ...options,
  });
}

/**
 * Hook for deep research endpoint (two-layer research)
 *
 * @example
 * ```tsx
 * const deepResearch = useDeepResearch();
 *
 * deepResearch.mutate({ query: "Climate change solutions" }, {
 *   onSuccess: (data) => console.log(data),
 * });
 * ```
 */
export function useDeepResearch(
  options?: UseMutationOptions<DeepResearchResponse, Error, ResearchRequest>
) {
  return useMutation({
    mutationFn: async (request: ResearchRequest) => {
      const { data, error } = await apiClient.POST("/deep-research", {
        params: { body: request },
      });

      if (error) {
        const message =
          (error as { detail?: string }).detail ||
          (error as { message?: string }).message ||
          "Deep research failed";
        throw new Error(message);
      }

      return data;
    },
    ...options,
  });
}

/**
 * Hook for multi-agent research endpoint
 *
 * @example
 * ```tsx
 * const multiAgentResearch = useMultiAgentResearch();
 *
 * multiAgentResearch.mutate({ query: "AI safety research" }, {
 *   onSuccess: (data) => {
 *     console.log(`Analyzed by ${data.subagents} agents`);
 *     console.log(`Total sources: ${data.total_sources}`);
 *   },
 * });
 * ```
 */
export function useMultiAgentResearch(
  options?: UseMutationOptions<
    MultiAgentResearchResponse,
    Error,
    ResearchRequest
  >
) {
  return useMutation({
    mutationFn: async (request: ResearchRequest) => {
      const { data, error } = await apiClient.POST("/multi-agent-research", {
        params: { body: request },
      });

      if (error) {
        const message =
          (error as { detail?: string }).detail ||
          (error as { message?: string }).message ||
          "Multi-agent research failed";
        throw new Error(message);
      }

      return data;
    },
    ...options,
  });
}
