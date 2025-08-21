import StatusTimeline from '@/components/tracker/StatusTimeLine';
import { getMockPatientStatus } from '@/lib/mock-data';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Home } from 'lucide-react';
import { use } from 'react'; // <-- 1. Impor 'use' dari React

interface StatusDetailPageProps {
  // Params bisa jadi sebuah Promise, jadi kita tandai
  params: {
    kode: string;
  } | Promise<{ kode: string }>;
}

// 2. Hapus 'async' karena React.use() menangani sifat asinkron
export default function StatusDetailPage({ params }: StatusDetailPageProps) {
  // 3. "Buka" atau "unwrap" params menggunakan React.use()
  // DIUBAH: Bungkus 'params' dengan Promise.resolve() untuk memastikan tipenya selalu benar
  const resolvedParams = use(Promise.resolve(params));
  const accessCode = resolvedParams.kode.trim();
  
  const statusData = getMockPatientStatus(accessCode);

  if (!statusData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-2xl mx-auto text-center p-8">
          <h3 className="text-xl font-bold text-red-600">Kode Tidak Ditemukan</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Pastikan ID Operasi <span className="font-mono bg-red-100 dark:bg-red-900/50 p-1 rounded">{accessCode}</span> sudah benar.
          </p>
          <Link href="/" className="inline-block mt-6">
            <Button variant="secondary">
                <Home size={16} className="mr-2"/> Kembali ke Homepage
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <StatusTimeline 
        accessCode={accessCode} 
        initialStatusData={statusData}
      />
    </div>
  );
}
