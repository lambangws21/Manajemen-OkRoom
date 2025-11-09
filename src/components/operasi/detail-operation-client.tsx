"use client";

import { useState } from "react";
import { OngoingSurgery, SurgeryLog } from "@/types";
import PatientWorkflowTracker from "@/components/operasi/patient-workflow-tracker";
import {Card }from "@/components/ui/ui/card";
import { toast } from 'sonner';

// ✅ Tipe aman, tanpa any
interface ExtendedOngoingSurgery extends OngoingSurgery {
  team?: {
    anesthesiologistId: string;
    nurseIds: string[];
  };
  surgeryLog?: SurgeryLog; 
}


interface OperasiDetailClientProps {
  initialSurgery: ExtendedOngoingSurgery;
}

// ✅ Tipe untuk PatientWorkflowTracker
type TrackerSurgery = OngoingSurgery & {
  patientName?: string;
  mrn?: string;
  surgeryLog?: SurgeryLog;
};

export default function OperasiDetailClient({ initialSurgery }: OperasiDetailClientProps) {
  const [surgery, setSurgery] = useState<ExtendedOngoingSurgery>(initialSurgery);

  const handleUpdate = async (
    _id: string,
    newStatus: string,
    log?: SurgeryLog
  ) => {
    if (!surgery) return;

    try {
      const res = await fetch(`/api/operasi/${surgery.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal memperbarui status operasi');
      }

      const updatedSurgery: OngoingSurgery = await res.json();

      const finalUpdate: ExtendedOngoingSurgery = {
        ...updatedSurgery,
        patientName: surgery.patientName,
        mrn: surgery.mrn,
        surgeryLog: log || surgery.surgeryLog,
      };

      setSurgery(finalUpdate);
      toast.success(`Status pasien diperbarui menjadi: ${newStatus}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(msg);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PatientWorkflowTracker
            surgery={surgery as TrackerSurgery}
            onUpdate={handleUpdate}
          />
        </div>

        <div className="lg:col-span-1">
          <Card className="p-5 shadow">
            <h3 className="text-lg font-bold border-b pb-2 mb-3 text-slate-500 dark:border-gray-700 dark:text-gray-600">
              Detail Pasien
            </h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-600">
              <p><strong>Nama:</strong> {surgery.patientName}</p>
              <p><strong>No. RM:</strong> {surgery.mrn}</p>
              <p><strong>Dokter:</strong> {surgery.doctorName}</p>
              <p><strong>Prosedur:</strong> {surgery.procedure}</p>
              <p><strong>Kamar:</strong> {surgery.operatingRoom}</p>
              <p><strong>Case ID:</strong> {surgery.caseId}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
