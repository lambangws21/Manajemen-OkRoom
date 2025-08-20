'use client';

import { useState } from 'react';
import { ScheduledSurgery, SurgeryLog } from '@/types';
import PatientWorkflowTracker from '@/components/operasi/PatientWorkflowTracker';
import Card from '@/components/ui/Card';

// Komponen ini menerima data awal sebagai prop
interface OperasiDetailClientProps {
  initialSurgery: ScheduledSurgery;
}

export default function OperasiDetailClient({ initialSurgery }: OperasiDetailClientProps) {
  // State untuk mengelola data operasi yang bisa berubah
  const [surgery, setSurgery] = useState<ScheduledSurgery>(initialSurgery);

  // Handler untuk memperbarui status
  const handleUpdate = (
    id: string,
    newStatus: ScheduledSurgery["status"],
    log?: SurgeryLog
  ) => {
    if (!surgery) return;

    const updatedSurgery = {
      ...surgery,
      status: newStatus,
      surgeryLog: log || surgery.surgeryLog,
    };
    setSurgery(updatedSurgery);

    console.log("Updated Surgery Data:", updatedSurgery);
    alert(`Status pasien diperbarui menjadi: ${newStatus}`);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PatientWorkflowTracker surgery={surgery} onUpdate={handleUpdate} />
        </div>
        <div className="lg:col-span-1">
          <Card>
            <h3 className="text-lg font-bold border-b pb-2 mb-3 dark:border-gray-700 dark:text-gray-100">
              Detail Pasien
            </h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Nama:</strong> {surgery.patientName}</p>
              <p><strong>No. RM:</strong> {surgery.mrn}</p>
              <p><strong>Dokter:</strong> {surgery.doctorName}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}