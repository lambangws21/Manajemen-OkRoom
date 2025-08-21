import { notFound } from "next/navigation";
import { mockScheduledSurgeries } from "@/lib/mock-data";
import OperasiDetailClient from "@/components/operasi/OperasiDetailClient";

// Next.js 15 App Router: params selalu sync, bukan Promise
export default async function OperasiDetailPage(
  props: { params: { id: string } }
) {
  const { id } = props.params;

  const surgery = mockScheduledSurgeries.find((s) => s.id === id);

  if (!surgery) {
    notFound();
  }

  return <OperasiDetailClient initialSurgery={surgery} />;
}
