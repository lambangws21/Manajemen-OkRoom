import { notFound } from "next/navigation";
import { mockScheduledSurgeries } from "@/lib/mock-data";
import OperasiDetailClient from "@/components/operasi/OperasiDetailClient";

export default async function OperasiDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const surgery = mockScheduledSurgeries.find((s) => s.id === params.id);

  if (!surgery) notFound();

  return <OperasiDetailClient initialSurgery={surgery} />;
}
