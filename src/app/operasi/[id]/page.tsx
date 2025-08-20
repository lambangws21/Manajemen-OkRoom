import { mockScheduledSurgeries } from "@/lib/mock-data";
import OperasiDetailClient from "@/components/operasi/OperasiDetailClient";
import { notFound } from "next/navigation";

// Ini adalah Server Component, jadi bisa async
export default async function OperasiDetailPage({ params }: { params: { id: string } }) {
  // 1. Ambil data di server
  const findSurgery = (id: string) => {
    return mockScheduledSurgeries.find((s) => s.id === id);
  };

  const surgery = findSurgery(params.id);

  // 2. Jika data tidak ditemukan, tampilkan halaman 404
  if (!surgery) {
    notFound();
  }

  // 3. Render komponen klien dan berikan data awal sebagai prop
  return <OperasiDetailClient initialSurgery={surgery} />;
}