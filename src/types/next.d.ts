// src/types/next.d.ts
export type AppPageProps<T extends Record<string, string>> = {
    params: T;
    searchParams?: Record<string, string | string[] | undefined>;
  };
  