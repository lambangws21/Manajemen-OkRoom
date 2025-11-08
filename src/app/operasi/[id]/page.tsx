import { notFound } from "next/navigation";
import OperasiDetailClient from "@/components/operasi/detail-operation-client";
import { OngoingSurgery } from "@/types";

async function getSurgeryById(id: string): Promise<OngoingSurgery | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const apiUrl = `${baseUrl}/api/operasi/${id}`;
    console.log("🔍 Fetching:", apiUrl);

    const res = await fetch(apiUrl, {
      cache: "no-store",
      next: { revalidate: 0 },
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error(`❌ Gagal memuat data operasi: ${res.status} ${res.statusText}`);
      return null;
    }

    const data: OngoingSurgery = await res.json();
    return data;
  } catch (err) {
    console.error("🔥 Terjadi kesalahan saat fetch data operasi:", err);
    return null;
  }
}

// ✅ Perhatikan params sekarang di-await
export default async function OperasiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ fix utama
  const surgery = await getSurgeryById(id);

  if (!surgery) {
    console.error("⚠️ Data operasi tidak ditemukan untuk ID:", id);
    notFound();
  }

  return <OperasiDetailClient initialSurgery={surgery} />;
}
