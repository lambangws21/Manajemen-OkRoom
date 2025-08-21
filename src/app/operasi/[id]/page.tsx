import { mockScheduledSurgeries } from "@/lib/mock-data";
import OperasiDetailClient from "@/components/operasi/OperasiDetailClient";
import { notFound } from "next/navigation";

// This is now a Server Component (no 'use client')
export default async function OperasiDetailPage({ params }: { params: { id: string } }) {
  // 1. Fetch data on the server
  const findSurgery = (id: string) => {
    return mockScheduledSurgeries.find((s) => s.id === id);
  };

  const surgery = findSurgery(params.id);

  // 2. If data is not found, show a 404 page
  if (!surgery) {
    notFound();
  }

  // 3. Render the Client Component with the initial data
  return <OperasiDetailClient initialSurgery={surgery} />;
}