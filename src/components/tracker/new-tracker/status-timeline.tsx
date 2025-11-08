// src/components/StatusTimeline.tsx
// Komponen utama yang merender seluruh UI timeline

import React from 'react';
import { Home } from 'lucide-react';
import { PatientStatusData, TimelineStatus } from '@/types/tracker';
import { Button } from '@/components/ui/ui/button';
import { Card } from '@/components/ui/ui/card';
import { TimelineItem } from '@/components/tracker/new-tracker/timeline-item'; 

interface StatusTimelineProps {
  accessCode: string;
  statusData: PatientStatusData; 
  onReset: () => void;
}

export function StatusTimeline({ accessCode, statusData, onReset }: StatusTimelineProps) {
  const { stages, currentStage } = statusData;
  const currentIndex = stages.findIndex(s => s.name === currentStage);
  
  // Menentukan status terakhir yang selesai
//   const lastCompletedIndex = stages.slice().reverse().findIndex(s => s.timestamp);
  const totalSteps = stages.length;
  const progressPercentage = (currentIndex + 1) / totalSteps * 100;
  
  // Ambil nama tahap aktif (misalnya, 'Operasi' dari "Operasi Berlangsung")
  const activeStageName = stages[currentIndex]?.name;

  return (
    <div className="max-w-2xl mx-auto mt-8">
        <div className="mb-4">
            <Button variant="secondary" onClick={onReset}>
                <Home size={16} className="mr-2"/> Cari Kode Lain
            </Button>
        </div>
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="p-6">
                <h2 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">
                    Status Operasi
                </h2>
                {statusData.patientName && (
                  <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Pasien: {statusData.patientName} ({statusData.mrn})
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                ID Operasi: <span className="font-mono bg-blue-50 dark:bg-gray-700 p-1 rounded text-blue-600 dark:text-blue-400">{accessCode}</span>
                </p>
                
                {/* Progress Bar */}
                <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Progress: {activeStageName}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                {stages.map((stage, index) => {
                    let status: TimelineStatus = 'Diterima'; 
                    
                    if (index < currentIndex) {
                      status = 'Ruang Pemulihan'; 
                    } else if (index === currentIndex) {
                       status = 'Operasi Berlangsung';
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
    </div>
  );
}