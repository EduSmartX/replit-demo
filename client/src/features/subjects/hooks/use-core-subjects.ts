/**
 * Core Subjects Hook
 * Fetches core subjects (master subject list) from the backend
 */

import { useQuery } from "@tanstack/react-query";
import { api, API_ENDPOINTS } from "@/lib/api";

export interface CoreSubject {
  id: number;
  public_id: string;
  name: string;
  code: string;
  description?: string;
}

export function useCoreSubjects() {
  return useQuery<CoreSubject[]>({
    queryKey: ["core", "subjects"],
    queryFn: async () => {
      const response = await api.get<CoreSubject[]>(API_ENDPOINTS.core.subjects);
      return response;
    },
  });
}
