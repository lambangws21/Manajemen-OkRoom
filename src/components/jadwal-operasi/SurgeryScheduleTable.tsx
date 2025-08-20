'use client';

import Link from 'next/link';
import { ScheduledSurgery } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { PlayCircle, Stethoscope, ClipboardList } from 'lucide-react';

interface SurgeryScheduleTableProps {
  surgeries: ScheduledSurgery[];
  onViewDetail: (surgery: ScheduledSurgery) => void;
}

export default function SurgeryScheduleTable({ surgeries, onViewDetail }: SurgeryScheduleTableProps) {
  const statusConfig: Record<ScheduledSurgery['status'], 'blue' | 'green' | 'red' | 'yellow' | 'indigo' | 'gray'> = {
    'Terjadwal': 'blue',
    'Terkonfirmasi': 'green',
    "Dipanggil": "green",
    "Siap Panggil": "blue",
    'Dibatalkan': 'red',
    'Pasien Diterima': 'yellow',
    'Persiapan Operasi': 'yellow',
    'Operasi Berlangsung': 'red',
    'Operasi Selesai': 'indigo',
    'Ruang Pemulihan': 'indigo',
  };

  return (
    <div>
      {/* ================================================================== */}
      {/* ## Tampilan Desktop (Layar Medium ke Atas) ## */}
      {/* ================================================================== */}
      <div className="hidden md:block">
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase">
              <tr>
                <th className="p-3">Pasien & No. RM</th>
                <th className="p-3">Prosedur</th>
                <th className="p-3 hidden lg:table-cell">Dokter</th>
                <th className="p-3">Jadwal</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {surgeries.map((surgery) => (
                <tr key={surgery.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-3">
                    <p className="font-medium text-gray-800 dark:text-gray-100">{surgery.patientName}</p>
                    <p className="text-xs text-gray-500">{surgery.mrn}</p>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">{surgery.procedure}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-300 hidden lg:table-cell">{surgery.doctorName}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">
                    {new Date(surgery.scheduledAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="p-3">
                    <Badge colorScheme={statusConfig[surgery.status] || 'gray'}>{surgery.status}</Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <Button variant="secondary" onClick={() => onViewDetail(surgery)}>Detail</Button>
                      <Link href={`/operasi/${surgery.id}`}>
                        <Button className="bg-green-600 hover:bg-green-700 focus:ring-green-500">
                          <PlayCircle size={16} className="mr-2"/> Kelola
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* ================================================================== */}
      {/* ## Tampilan Mobile & Tablet (Layar Kecil) ## */}
      {/* ================================================================== */}
      <div className="block md:hidden space-y-4">
        {surgeries.map(surgery => (
          <Card key={surgery.id}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{surgery.patientName}</p>
                <p className="text-sm text-gray-500">{surgery.mrn}</p>
              </div>
              <Badge colorScheme={statusConfig[surgery.status] || 'gray'}>{surgery.status}</Badge>
            </div>
            <div className="border-t my-3 dark:border-gray-700"></div>
            <div className="space-y-2 text-sm">
              <p className="flex items-center text-gray-700 dark:text-gray-300"><ClipboardList size={14} className="mr-2 text-gray-400"/> {surgery.procedure}</p>
              <p className="flex items-center text-gray-700 dark:text-gray-300"><Stethoscope size={14} className="mr-2 text-gray-400"/> {surgery.doctorName}</p>
              <p className="text-gray-500 text-xs mt-2">
                Jadwal: {new Date(surgery.scheduledAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            </div>
            <div className="border-t my-3 dark:border-gray-700"></div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => onViewDetail(surgery)}>Detail</Button>
              <Link href={`/operasi/${surgery.id}`} className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500">
                  <PlayCircle size={16} className="mr-2"/> Kelola
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}