'use client';

import { ScheduledSurgery } from '@/types';
import {Button} from '@/components/ui/ui/button';
import { X, UserCheck, ArrowRightLeft, Activity } from 'lucide-react';

// Tipe untuk status baru yang bisa diubah
// type ActionableStatus = 'Operasi Berlangsung' | 'Ruang Pemulihan';

interface PatientActionModalProps {
  surgery: ScheduledSurgery;
  onClose: () => void;
  // Fungsi untuk mengubah status
  onUpdateStatus: (id: string, newStatus: ScheduledSurgery['status']) => void;
  // Fungsi untuk serah terima
  onHandover: (id: string, notes: string) => void;
}

export default function PatientActionModal({ surgery, onClose, onUpdateStatus, onHandover }: PatientActionModalProps) {
  // Aksi yang tersedia berdasarkan status pasien saat ini
  const canReceive = surgery.status === 'Terkonfirmasi';
  const canStartSurgery = surgery.status === 'Pasien Diterima';
  const canMoveToRecovery = surgery.status === 'Operasi Berlangsung';
  const canHandover = surgery.status === 'Operasi Berlangsung' || surgery.status === 'Ruang Pemulihan';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-down" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X size={24} />
        </button>

        <header className="border-b dark:border-gray-700 pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Aksi untuk Pasien</h2>
          <p className="text-gray-600 dark:text-gray-300">{surgery.patientName} - {surgery.mrn}</p>
        </header>

        <main className="space-y-3">
          {/* Aksi Menerima Pasien */}
          <Button 
            onClick={() => onUpdateStatus(surgery.id, 'Pasien Diterima')}
            disabled={!canReceive}
            className="w-full flex justify-center items-center"
          >
            <UserCheck size={18} className="mr-2"/> Terima Pasien di Ruang Persiapan
          </Button>

          {/* Aksi Mengubah Status */}
          <Button 
            onClick={() => onUpdateStatus(surgery.id, 'Operasi Berlangsung')}
            disabled={!canStartSurgery}
            className="w-full flex justify-center items-center"
            variant="secondary"
          >
            <Activity size={18} className="mr-2"/> Mulai Operasi
          </Button>

           <Button 
            onClick={() => onUpdateStatus(surgery.id, 'Ruang Pemulihan')}
            disabled={!canMoveToRecovery}
            className="w-full flex justify-center items-center"
            variant="secondary"
          >
            <Activity size={18} className="mr-2"/> Pindah ke Ruang Pemulihan
          </Button>

          {/* Aksi Serah Terima Pasien */}
          <Button 
            onClick={() => onHandover(surgery.id, 'Pasien diserahkan dalam kondisi stabil.')}
            disabled={!canHandover}
            className="w-full flex justify-center items-center"
            variant="secondary"
          >
            <ArrowRightLeft size={18} className="mr-2"/> Lakukan Serah Terima
          </Button>
        </main>
      </div>
    </div>
  );
}