import { notFound } from "next/navigation";
import { mockScheduledSurgeries } from "@/lib/mock-data";
import OperasiDetailClient from "@/components/operasi/OperasiDetailClient";
import type { AppPageProps } from "@/types/next";

export default async function OperasiDetailPage(
  { params }: AppPageProps<{ id: string }>
) {
  const surgery = mockScheduledSurgeries.find((s) => s.id === params.id);

  if (!surgery) notFound();

  return <OperasiDetailClient initialSurgery={surgery} />;
}
