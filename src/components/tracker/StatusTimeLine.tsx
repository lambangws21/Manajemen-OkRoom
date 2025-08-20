'use client';

import { PatientStatusData } from '@/types';
import TimelineItem from '@/components/tracker/TimeLineItem';
import Card from '@/components/ui/Card';
import { getMockPatientStatus } from '@/lib/mock-data'; // Impor fungsi dinamis

interface StatusTimelineProps {
  accessCode: string;
}

export default function StatusTimeline({ accessCode }: StatusTimelineProps) {
  // Langsung panggil fungsi dinamis untuk mendapatkan data
  // Tidak perlu lagi state atau useEffect di sini
  const statusData: PatientStatusData | null = getMockPatientStatus(accessCode);

  if (!statusData) {
      return (
        <Card className="max-w-2xl mx-auto mt-8 text-center p-8">
          <h3 className="text-xl font-bold text-red-600">Kode Tidak Ditemukan</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Pastikan ID Operasi <span className="font-mono bg-red-100 dark:bg-red-900/50 p-1 rounded">{accessCode}</span> sudah benar atau operasi belum dibatalkan.
          </p>
        </Card>
      );
  }

  const { stages, currentStage } = statusData;
  const currentIndex = stages.findIndex(s => s.name === currentStage);

  return (
    <Card className="max-w-2xl mx-auto mt-8 dark:bg-gray-800">
       <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Progres Pasien</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          ID Operasi: <span className="font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded text-blue-600 dark:text-blue-400">{accessCode}</span>
        </p>
        
        <div className="space-y-2">
          {stages.map((stage, index) => {
              let status: 'completed' | 'active' | 'pending' = 'pending';
              if (stage.timestamp !== null) {
                status = 'completed';
              }
              if (stage.name === currentStage) {
                status = 'active';
              }
              // Jika status aktifnya sudah lewat, anggap semua sebelumnya selesai
              if (index < currentIndex) {
                status = 'completed';
              }

              return (
                  <TimelineItem 
                      key={stage.name}
                      title={stage.name}
                      timestamp={stage.timestamp}
                      description={stage.desc}
                      status={status}
                      isLast={index === stages.length - 1}
                  />
              )
          })}
        </div>
       </div>
    </Card>
  );
}