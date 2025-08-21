'use client';

import { useState } from 'react';
import { ScheduledSurgery, SurgeryLog } from '@/types';
import PatientWorkflowTracker from '@/components/operasi/PatientWorkflowTracker';
import Card from '@/components/ui/Card';
import { mockScheduledSurgeries } from '@/lib/mock-data';

// This component receives the initial data as a prop
interface OperasiDetailClientProps {
  initialSurgery: ScheduledSurgery;
}

export default function OperasiDetailClient({ initialSurgery }: OperasiDetailClientProps) {
  // State to manage the surgery data, which can change
  const [surgery, setSurgery] = useState<ScheduledSurgery>(initialSurgery);

  // Handler to update the status
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

    // In a real app, you would also update the mock data "database" here
    const patientInDb = mockScheduledSurgeries.find(p => p.id === id);
    if (patientInDb) {
      patientInDb.status = newStatus;
      if (log) patientInDb.surgeryLog = log;
    }

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
