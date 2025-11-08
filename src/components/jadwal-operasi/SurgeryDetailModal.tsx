'use client';
import { ScheduledSurgery } from '@/types';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/Badge';
import { X, User, Stethoscope, Calendar, ClipboardList } from 'lucide-react';

interface SurgeryDetailModalProps {
  surgery: ScheduledSurgery;
  onClose: () => void;
}

// Sub-komponen baris detail
const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start py-3">
    <div className="text-gray-500 mr-4 mt-1">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-lg text-gray-800 font-semibold">{value}</p>
    </div>
  </div>
);

export default function SurgeryDetailModal({
  surgery,
  onClose,
}: SurgeryDetailModalProps) {
  const statusConfig: Record<
    ScheduledSurgery['status'],
    'blue' | 'green' | 'red' | 'yellow' | 'indigo'
  > = {
    Terjadwal: 'blue',
    Terkonfirmasi: 'green',
    Dibatalkan: 'red',
    'Pasien Diterima': 'yellow',
    'Operasi Berlangsung': 'red',
    'Ruang Pemulihan': 'indigo',
    'Operasi Selesai': 'green',
    'Persiapan Operasi': 'green',
    Dipanggil: 'green',
    'Siap Panggil': 'green',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in-down">
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <header className="border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Detail Jadwal Operasi
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-500">ID: {surgery.id}</p>
            <Badge colorScheme={statusConfig[surgery.status]}>
              {surgery.status}
            </Badge>
          </div>
        </header>

        <main className="divide-y">
          <DetailRow
            icon={<User size={20} />}
            label="Nama Pasien"
            value={surgery.patientName}
          />
          <DetailRow
            icon={<ClipboardList size={20} />}
            label="Nomor Rekam Medis"
            value={surgery.mrn}
          />
          <DetailRow
            icon={<ClipboardList size={20} />}
            label="Prosedur Direncanakan"
            value={surgery.procedure}
          />
          <DetailRow
            icon={<Stethoscope size={20} />}
            label="Dokter Penanggung Jawab"
            value={surgery.doctorName}
          />
          <DetailRow
            icon={<Calendar size={20} />}
            label="Jadwal Operasi"
            // ✅ gunakan 'scheduledAt' yang benar
            value={new Date(surgery.scheduledAt).toLocaleString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Makassar',
            })}
          />
        </main>

        <footer className="flex justify-end gap-4 pt-6 mt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
          <Button variant="primary">Edit Jadwal</Button>
        </footer>
      </div>
    </div>
  );
}
