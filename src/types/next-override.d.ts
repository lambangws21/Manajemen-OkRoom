declare module "next" {
    // override PageProps supaya params bukan Promise
    export interface PageProps {
      params?: Record<string, string>;
      searchParams?: Record<string, string | string[] | undefined>;
    }
  }
  