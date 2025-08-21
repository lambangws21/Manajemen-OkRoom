import { notFound } from "next/navigation";
import { mockScheduledSurgeries } from "@/lib/mock-data";
import OperasiDetailClient from "@/components/operasi/OperasiDetailClient";

// ❌ Jangan pakai PageProps dari next
// ✅ Tulis manual
type OperasiPageProps = {
  params: {
    id: string;
  };
};

export default async function OperasiDetailPage({ params }: OperasiPageProps) {
  const { id } = params;

  const surgery = mockScheduledSurgeries.find((s) => s.id === id);

  if (!surgery) {
    notFound();
  }

  return <OperasiDetailClient initialSurgery={surgery} />;
}
