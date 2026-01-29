import { useQuery } from "@tanstack/react-query";
import { fetchClasses, fetchCoreClasses } from "@/lib/api/class-api";
import { fetchTeachers } from "@/lib/api/teacher-api";
import { PAGE_SIZES, QUERY_KEYS, STALE_TIMES } from "@/lib/constants";

export const useClasses = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.CLASSES],
    queryFn: () => fetchClasses({ page: 1, page_size: PAGE_SIZES.EXTRA_LARGE }),
    staleTime: STALE_TIMES.STATIC,
  });
};

export const useCoreClasses = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.CORE_CLASSES],
    queryFn: () => fetchCoreClasses({ page: 1, page_size: PAGE_SIZES.EXTRA_LARGE }),
    staleTime: STALE_TIMES.STATIC,
  });
};

export const useTeachers = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.TEACHERS],
    queryFn: () => fetchTeachers({ page: 1, page_size: PAGE_SIZES.EXTRA_LARGE }),
    staleTime: STALE_TIMES.STATIC,
  });
};
