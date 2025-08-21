'use client';
import useSWR from 'swr';
import StatusCard from './StatusCard';
import Spinner from '@/components/ui/Spinner';
import { mockSurgeryBoard } from '@/lib/mock-data';
import { OngoingSurgery } from '@/types';

// The 'url' parameter is removed here as it is not used
const fetcher = (): Promise<OngoingSurgery[]> => 
  new Promise(resolve => setTimeout(() => resolve(mockSurgeryBoard), 1000));

export default function SurgeryStatusBoard() {
  // Since the fetcher doesn't use the URL, the key can be simplified
  const { data: surgeryList, error, isLoading } = useSWR(
    'surgery-status-key', // A simple, unique key
    fetcher,
    { refreshInterval: 30000 }
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>;
  }

  if (error || !surgeryList) {
    return <p className="text-center text-red-500 text-2xl">Gagal memuat data.</p>;
  }
  
  if (surgeryList.length === 0) {
    return <p className="text-center text-gray-500 text-2xl">Tidak ada operasi yang sedang berlangsung.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {surgeryList.map((surgery) => (
        <StatusCard key={surgery.caseId} data={surgery} />
      ))}
    </div>
  );
}