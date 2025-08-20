'use client';
import { ScheduledSurgery } from '@/types';
import { Hospital } from 'lucide-react';
import Button from '@/components/ui/Button';

interface TodayScheduleTableProps {
  todaysSchedule: ScheduledSurgery[];
  onAssignOR: (surgery: ScheduledSurgery) => void;
}

  /**
   * Table yang menampilkan daftar operasi yang dijadwalkan untuk hari ini.
   * Masing-masing baris berisi informasi tentang pasien, jadwal operasi,
   * ruang OK yang ditugaskan, dan tombol untuk mengassign ruang OK.
   * Komponen ini akan menerima prop `todaysSchedule` yang berisi daftar operasi
   * yang dijadwalkan untuk hari ini dan fungsi `onAssignOR` yang akan dieksekusi
   * ketika tombol "Petakan ke OK" diklik.
   */
export default function TodayScheduleTable({ todaysSchedule, onAssignOR }: TodayScheduleTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="p-3">Pasien</th>
            <th className="p-3">Jadwal</th>
            <th className="p-3">Ruang OK Ditugaskan</th>
            <th className="p-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-gray-700">
          {todaysSchedule.map(surgery => (
            <tr key={surgery.id}>
              <td className="p-3"><p className="font-medium">{surgery.patientName}</p><p className="text-xs text-gray-500">{surgery.procedure}</p></td>
              <td className="p-3">{new Date(surgery.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
              <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">{surgery.assignedOR || 'Belum ada'}</td>
              <td className="p-3 text-center">
                <Button size="sm" onClick={() => onAssignOR(surgery)}>
                  <Hospital size={14} className="mr-2" /> Petakan ke OK
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}