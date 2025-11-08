'use client';

import { useState } from 'react';
// 💥 DIHAPUS: StaffMember, PatientHandoverModal, ArrowRightLeft
import { SurgeryLog, OngoingSurgery } from '@/types'; 
import {Button} from '@/components/ui/ui/button';
import {Card} from '@/components/ui/ui/card';
import FinishSurgeryModal from './FinishSurgeryModal';
import {
  CheckCircle,
  Circle,
  UserCheck,
  PhoneMissed,
} from 'lucide-react';

// 💥 PERBAIKAN TIPE: Gunakan interface merging (atau deklarasi ulang yang diperluas)
interface ExtendedOngoingSurgery extends OngoingSurgery {
  team?: {
    anesthesiologistId: string;
    nurseIds: string[];
  };
  surgeryLog?: SurgeryLog; 
}
  


// Daftar tahapan yang relevan untuk alur ini (Hanya status yang ada di OngoingSurgeries)
const steps = [
  'Pasien Diterima', 
  'Persiapan Operasi',
  'Operasi Berlangsung',
  'Operasi Selesai',
  'Ruang Pemulihan',
];

// 💡 Fungsi utilitas untuk memetakan nama status ke kunci log waktu
// Asumsi: Kunci log waktu di SurgeryLog mirip dengan ini. Sesuaikan jika tipe log berbeda.
const getTimeKeyForStep = (step: string): keyof SurgeryLog | null => {
  switch (step) {
    case 'Pasien Diterima':
      return 'timePatientAccepted';
    case 'Persiapan Operasi':
      // Asumsi log waktu ini dicatat saat "Persiapan Operasi" selesai, 
      // atau saat status "Operasi Berlangsung" dimulai.
      return 'timePreparationStarted'; 
    case 'Operasi Berlangsung':
      // Log waktu ini dicatat saat status "Operasi Selesai" dimulai.
      return 'timeSurgeryEnded';
    case 'Operasi Selesai':
      return 'timeRecoveryStarted'; // Log waktu saat pindah ke pemulihan
    case 'Ruang Pemulihan':
      return 'timePatientOut'; // Log waktu saat keluar dari ruang pemulihan
    default:
      return null;
  }
};

// 💡 Fungsi untuk memformat timestamp (asumsi timestamp berupa ISO string atau Date object)
const formatTime = (timestamp: string | Date | undefined): string => {
  if (!timestamp) return '';
  try {
    // Pilihan format: hanya jam dan menit
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    console.error("Error formatting time:", e);
    return '';
  }
};

interface OperatingRoomFlowProps {
  // 💥 PERBAIKAN: Gunakan tipe yang diperluas
  surgery: ExtendedOngoingSurgery;
  // 💥 PERBAIKAN: onUpdate harus memanggil string untuk newStatus
  onUpdate: (
    id: string,
    newStatus: string, // Mengirim string status
    log?: SurgeryLog
  ) => Promise<void>; // Asumsi ini mengembalikan Promise
}

export default function OperatingRoomFlow({
  surgery,
  onUpdate,
}: OperatingRoomFlowProps) {
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

  const isPatientInORFlow = steps.includes(surgery.status as string);

  if (!isPatientInORFlow) {
    return (
      <Card>
        <div className="text-center py-10">
          <PhoneMissed size={48} className="mx-auto text-orange-500 mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-800">
            Menunggu Pasien Diterima
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
            Pasien harus diselesaikan serah terima di Papan Serah Terima Pasien** sebelum memulai alur ini. Status saat ini: {surgery.status}
          </p>
        </div>
      </Card>
    );
  }
  // ===============================

  // Gunakan type assertion untuk memastikan currentStepIndex ditemukan
  const currentStepIndex = steps.indexOf(surgery.status as string);

  const handleFinishSubmit = async (log: SurgeryLog) => {
    // 💥 PERUBAHAN: Panggil onUpdate dengan status dan log
    await onUpdate(surgery.id, "Operasi Selesai", log);
    setIsFinishModalOpen(false);
  };

  // Logika tombol aksi yang lebih spesifik
  const renderNextAction = () => {
    // 💥 PERBAIKAN: Gunakan type assertion (as string) untuk switch case
    switch (surgery.status as string) {
      case "Pasien Diterima":
        return (
          <Button onClick={() => onUpdate(surgery.id, "Persiapan Operasi")}>
            <UserCheck className="mr-2" size={18} />
            Mulai Persiapan di OK
          </Button>
        );
      case "Persiapan Operasi":
        // 💡 Catat waktu "Persiapan Operasi" selesai saat tombol ini diklik
        return (
          <Button onClick={() => onUpdate(surgery.id, "Operasi Berlangsung", { 
             timePreparationStarted: new Date().toISOString() // Simpan log waktu
          } as SurgeryLog)}>
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
        // 💡 Catat waktu "Operasi Selesai" selesai saat tombol ini diklik
        return (
          <Button onClick={() => onUpdate(surgery.id, "Ruang Pemulihan", {
            timeRecoveryStarted: new Date().toISOString() // Simpan log waktu
          } as SurgeryLog)}>
            Pindah ke Ruang Pemulihan
          </Button>
        );
      case "Ruang Pemulihan":
        return (
          <p className="text-orange-600 font-semibold">
            Pasien berada di Ruang Pemulihan.
          </p>
        );
      default:
        return (
          <p className="text-gray-500 font-semibold">
            Proses alur telah selesai atau status tidak dikenal.
          </p>
        );
    }
  };

  return (
    <>
      <Card>
        <h2 className="text-xl font-bold mb-2 dark:text-gray-100">Alur Kerja Operasi</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Status Saat Ini:{" "}
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {surgery.status}
          </span>
        </p>
        {/* Visualisasi Langkah yang telah dimodifikasi */}
        <div className="flex flex-wrap items-center mb-8">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const timeKey = getTimeKeyForStep(step);
            // Ambil waktu dari surgeryLog berdasarkan kunci
            // Untuk "Operasi Berlangsung", kita ingin menampilkan waktu operasi berakhir.
            const timeValue = timeKey 
              ? surgery.surgeryLog?.[timeKey] 
              : undefined;
            const timeDisplay = formatTime(timeValue as string | undefined);

            return (
              <div key={step} className="flex items-center min-w-[120px] flex-1">
                <div className="flex flex-col items-center">
                  {isCompleted ? (
                    <CheckCircle size={32} className="text-green-500" />
                  ) : (
                    <Circle size={32} className="text-gray-300 dark:text-gray-600" />
                  )}
                  <p className={`text-xs mt-1 text-center ${ isCompleted ? "font-semibold text-gray-700 dark:text-gray-600" : "text-gray-500" }`}>
                    {step}
                    {/* 💡 TAMBAHAN: Tampilkan waktu jika tersedia */}
                    {timeDisplay && (
                       <span className="block text-xs font-normal text-blue-500">
                           {timeDisplay}
                       </span>
                    )}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-grow h-1 mx-2 ${ index < currentStepIndex ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600" }`}></div>
                )}
              </div>
            );
          })}
        </div>
        <div className="text-center border-t dark:border-gray-700 pt-6">
          <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">Aksi Berikutnya:</h3>
          {renderNextAction()}
        </div>
      </Card>
      
      {isFinishModalOpen && (
        <FinishSurgeryModal
          // Catat waktu operasi berakhir di log saat submit dari modal
          onSubmit={(log) => handleFinishSubmit({ ...log, timeSurgeryEnded: new Date().toISOString() } as SurgeryLog)}
          onClose={() => setIsFinishModalOpen(false)}
        />
      )}
    </>
  );
}