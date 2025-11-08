'use client';

import { PatientStatusData } from '@/types';
import TimelineItem from '@/components/tracker/TimeLineItem';
import {Card }from '@/components/ui/ui/card';
import{ Button} from '@/components/ui/ui/button';
import Link from 'next/link';
import { Home } from 'lucide-react';

interface StatusTimelineProps {
  accessCode: string;
  initialStatusData: PatientStatusData; // <-- Terima data awal
}

export default function StatusTimeline({ accessCode, initialStatusData }: StatusTimelineProps) {
  // Langsung gunakan data dari server, tidak perlu panggil getMockPatientStatus lagi
  const statusData = initialStatusData;

  const { stages, currentStage } = statusData;
  const currentIndex = stages.findIndex(s => s.name === currentStage);

  return (
    <div className="max-w-2xl mx-auto mt-8">
        <div className="mb-4">
            <Link href="/">
                <Button variant="secondary">
                    <Home size={16} className="mr-2"/> Kembali ke Homepage
                </Button>
            </Link>
        </div>
        <Card className="dark:bg-gray-800">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Progres Pasien</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                ID Operasi: <span className="font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded text-blue-600 dark:text-blue-400">{accessCode}</span>
                </p>
                
                <div className="space-y-2">
                {stages.map((stage, index) => {
                    let status: 'Diterima' | 'Operasi Berlangsung' | 'Ruang Pemulihan' = 'Ruang Pemulihan';
                    if (index < currentIndex) status = 'Diterima';
                    if (index === currentIndex) status = 'Ruang Pemulihan';

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
    </div>
  );
}