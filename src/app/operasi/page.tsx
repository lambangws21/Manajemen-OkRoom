import { mockScheduledSurgeries } from "@/lib/mock-data";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { PlayCircle } from "lucide-react";


// Definisikan tipe untuk warna yang diizinkan oleh komponen Badge
type BadgeColor = 'yellow' | 'red' | 'indigo' | 'gray';

// Komponen Kartu Pasien
const OngoingPatientCard = ({ surgery }: { surgery: typeof mockScheduledSurgeries[0] }) => {
  // SOLUSI: Berikan tipe yang spesifik pada statusConfig
  const statusConfig: Record<string, BadgeColor> = {
    'Persiapan Operasi': 'yellow',
    'Operasi Berlangsung': 'red',
    'Ruang Pemulihan': 'indigo',
  };

  return (
    <Link href={`/operasi/${surgery.id}`}>
      <Card className="group hover:ring-2 hover:ring-blue-500 hover:shadow-xl transition-all">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{surgery.patientName}</p>
            <p className="text-sm text-gray-500">{surgery.mrn}</p>
          </div>
          {/* SOLUSI: Hapus 'as keyof typeof statusConfig' yang tidak lagi diperlukan */}
          <Badge colorScheme={statusConfig[surgery.status] || 'gray'}>
            {surgery.status}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{surgery.procedure}</p>
        <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm mt-auto">
          Kelola Pasien
          <PlayCircle size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </Link>
  );
};


// Halaman Utama Operasi (Server Component)
export default async function OperasiPage() {
  // Filter untuk mendapatkan pasien yang sedang dalam alur operasi
  const ongoingSurgeries = mockScheduledSurgeries.filter(s =>
    ['Persiapan Operasi', 'Operasi Berlangsung', 'Ruang Pemulihan'].includes(s.status)
  );

  return (
    <div className="p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Pasien di Kamar Operasi
        </h1>
        <p className="text-gray-500 mt-1">
          Berikut adalah daftar pasien yang sedang ditangani di dalam alur kamar operasi saat ini.
        </p>
      </header>

      {ongoingSurgeries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ongoingSurgeries.map(surgery => (
            <OngoingPatientCard key={surgery.id} surgery={surgery} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-10">
          <p className="text-gray-500">Tidak ada pasien yang sedang dalam proses operasi saat ini.</p>
        </Card>
      )}
    </div>
  );
}
