// DIUBAH: Perbaiki salah ketik pada nama komponen
import StatusTimeline from '@/components/tracker/StatusTimeLine';

interface StatusDetailPageProps {
  params: {
    kode: string;
  };
}

// Menggunakan 'async function' adalah praktik modern dari Next.js
export default async function StatusDetailPage({ params }: StatusDetailPageProps) {
  // DIUBAH: Hapus .toUpperCase() dan biarkan .trim() saja
  const accessCode = params.kode.trim();

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      {/* Komponen StatusTimeline akan menerima kode akses
          dan memanggil fungsi getMockPatientStatus untuk mendapatkan data */}
      <StatusTimeline accessCode={accessCode} />
    </div>
  );
}