"use client";

import { useState } from "react";
import { ScheduledSurgery, SurgeryLog, StaffMember } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FinishSurgeryModal from "@/components/operasi/FinishSurgeryModal";
import PatientHandoverModal from "@/components/operasi/PatientHandOverModal";
import {
  CheckCircle,
  Circle,
  ArrowRightLeft,
  UserCheck,
  PhoneMissed,
} from "lucide-react";

const steps = [
  "Dipanggil",
  "Pasien Diterima",
  "Persiapan Operasi",
  "Operasi Berlangsung",
  "Operasi Selesai",
  "Ruang Pemulihan",
];

interface OperatingRoomFlowProps {
  surgery: ScheduledSurgery;
  onUpdate: (
    id: string,
    newStatus: ScheduledSurgery["status"],
    log?: SurgeryLog
  ) => void;
}

export default function OperatingRoomFlow({
  surgery,
  onUpdate,
}: OperatingRoomFlowProps) {
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);

  const isPatientReadyForOR = steps.includes(surgery.status); // Cara cek yang lebih ringkas

  const currentStepIndex = steps.indexOf(surgery.status);

  if (!isPatientReadyForOR && surgery.status !== "Terkonfirmasi") {
    return (
      <Card>
        <div className="text-center py-10">
          <PhoneMissed size={48} className="mx-auto text-orange-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Menunggu Pasien Dipanggil
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Pasien ini belum bisa diproses. Silakan kembali ke **Papan Kendali
            Operasi** untuk menugaskan OK/Tim dan memanggil pasien.
          </p>
        </div>
      </Card>
    );
  }

  const handleFinishSubmit = (log: SurgeryLog) => {
    onUpdate(surgery.id, "Operasi Selesai", log);
    setIsFinishModalOpen(false);
  };

  // SOLUSI: Gunakan parameter 'team' yang diterima
  const handleHandoverSubmit = (notes: string, team: StaffMember[]) => {
    console.log(`Serah terima untuk ${surgery.patientName} dicatat: ${notes}`);
    console.log("Diterima oleh tim:", team.map((t) => t.name).join(", ")); // Gunakan 'team' di sini
    onUpdate(surgery.id, "Pasien Diterima");
    setIsHandoverModalOpen(false);
  };

  const renderNextAction = () => {
    // Digabung agar 'Terkonfirmasi' dan 'Dipanggil' bisa memulai serah terima
    switch (surgery.status) {
      case "Terkonfirmasi":
      case "Dipanggil":
        return (
          <Button onClick={() => setIsHandoverModalOpen(true)}>
            <ArrowRightLeft className="mr-2" size={18} />
            Lakukan Serah Terima
          </Button>
        );
      case "Pasien Diterima":
        // ... (sisa switch case tidak berubah)
        return (
          <Button onClick={() => onUpdate(surgery.id, "Persiapan Operasi")}>
            <UserCheck className="mr-2" size={18} />
            Mulai Persiapan di OK
          </Button>
        );
      case "Persiapan Operasi":
        return (
          <Button onClick={() => onUpdate(surgery.id, "Operasi Berlangsung")}>
            Mulai Operasi
          </Button>
        );
      case "Operasi Berlangsung":
        return (
          <Button onClick={() => setIsFinishModalOpen(true)}>
            Selesaikan Operasi
          </Button>
        );
      case "Operasi Selesai":
        return (
          <Button onClick={() => onUpdate(surgery.id, "Ruang Pemulihan")}>
            Pindah ke Ruang Pemulihan
          </Button>
        );
      default:
        return (
          <p className="text-green-600 font-semibold">
            Semua proses telah selesai.
          </p>
        );
    }
  };

  return (
    <>
      <Card>
        <h2 className="text-xl font-bold mb-2 dark:text-gray-600">
          Alur Kerja Operasi
        </h2>

        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Status Saat Ini:{" "}
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {surgery.status}
          </span>
        </p>

        {/* Visual Stepper */}

        <div className="flex flex-wrap items-center mb-8">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center min-w-[120px] flex-1">
              <div className="flex flex-col items-center">
                {index <= currentStepIndex ? (
                  <CheckCircle size={32} className="text-green-500" />
                ) : (
                  <Circle
                    size={32}
                    className="text-gray-300 dark:text-gray-600"
                  />
                )}

                <p
                  className={`text-xs mt-1 text-center ${
                    index <= currentStepIndex
                      ? "font-semibold text-gray-700 dark:text-gray-200"
                      : "text-gray-500"
                  }`}
                >
                  {step}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`flex-grow h-1 mx-2 ${
                    index < currentStepIndex
                      ? "bg-green-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Tombol Aksi */}

        <div className="text-center border-t dark:border-gray-700 pt-6">
          <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">
            Aksi Berikutnya:
          </h3>

          {renderNextAction()}
        </div>
      </Card>

      {isHandoverModalOpen && (
        <PatientHandoverModal
          surgery={surgery}
          onClose={() => setIsHandoverModalOpen(false)}
          onSubmit={handleHandoverSubmit}
        />
      )}

      {isFinishModalOpen && (
        <FinishSurgeryModal
          onClose={() => setIsFinishModalOpen(false)}
          onSubmit={handleFinishSubmit}
        />
      )}
    </>
  );
}
