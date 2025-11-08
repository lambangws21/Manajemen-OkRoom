'use client';

import Link from 'next/link';
import { ScheduledSurgery, OperatingRoomShiftPopulated } from '@/types';
import {Card} from '@/components/ui/ui/card';
import {Badge} from '@/components/ui/ui/badge';
import{ Button }from '@/components/ui/ui/button';
import { PlayCircle, Users, Hospital } from 'lucide-react';
import { getCurrentShift } from '@/lib/utils';

interface SurgeryScheduleTableProps {
  surgeries: ScheduledSurgery[];
  shiftAssignments: OperatingRoomShiftPopulated[];
  onViewDetail: (surgery: ScheduledSurgery) => void;
}

type BadgeColor = 'blue' | 'green' | 'red' | 'yellow' | 'indigo' | 'gray';

export default function SurgeryScheduleTable({
  surgeries,
  shiftAssignments,
  onViewDetail,
}: SurgeryScheduleTableProps) {
  const statusConfig: Record<ScheduledSurgery['status'], BadgeColor> = {
    Terjadwal: 'blue',
    Terkonfirmasi: 'green',
    Dipanggil: 'green',
    'Siap Panggil': 'blue',
    Dibatalkan: 'red',
    'Pasien Diterima': 'yellow',
    'Persiapan Operasi': 'yellow',
    'Operasi Berlangsung': 'red',
    'Operasi Selesai': 'indigo',
    'Ruang Pemulihan': 'indigo',
  };

  const activeShift = getCurrentShift();

  return (
    <div>
      {/* 🖥️ Desktop View */}
      <div className="hidden md:block">
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-200">
              <tr>
                <th className="p-3">Pasien</th>
                <th className="p-3">Jadwal</th>
                <th className="p-3">Penugasan (OK & Tim)</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {surgeries.map((surgery) => {
                const assignedTeam = shiftAssignments.find(
                  (a) =>
                    surgery.assignedOR &&
                    a.operatingRoom.includes(surgery.assignedOR.split(' ')[1]) &&
                    a.shift === activeShift
                );

                return (
                  <tr key={surgery.id} className="dark:hover:bg-gray-800">
                    <td>
                      <p className="font-medium">{surgery.patientName}</p>
                      <p className="text-xs text-gray-500">{surgery.procedure}</p>
                    </td>

                    <td>
                      {new Date(surgery.scheduledAt).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>

                    <td>
                      <div className="flex items-center gap-1 font-semibold">
                        <Hospital size={14} /> {surgery.assignedOR || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Users size={14} />{' '}
                        {assignedTeam?.nurses
                          .map((n: { name: string }) => n.name)
                          .join(', ') || 'N/A'}
                      </div>
                    </td>

                    <td>
                      <Badge color={statusConfig[surgery.status] || 'gray'}>
                        {surgery.status}
                      </Badge>
                    </td>

                    <td className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onViewDetail(surgery)}
                        >
                          Detail
                        </Button>
                        <Link href={`/operasi/${surgery.id}`}>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <PlayCircle size={14} className="mr-2" /> Kelola
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      {/* 📱 Mobile View */}
      <div className="block md:hidden space-y-4">
        {surgeries.map((surgery) => {
          const assignedTeam = shiftAssignments.find(
            (a) =>
              surgery.assignedOR &&
              a.operatingRoom.includes(surgery.assignedOR.split(' ')[1]) &&
              a.shift === activeShift
          );

          return (
            <Card key={surgery.id}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-lg">{surgery.patientName}</p>
                  <p className="text-sm text-gray-500">{surgery.mrn}</p>
                </div>
                <Badge color={statusConfig[surgery.status] || 'gray'}>
                  {surgery.status}
                </Badge>
              </div>

              <div className="text-sm space-y-2 border-t pt-3">
                <p>
                  <strong>Jadwal:</strong>{' '}
                  {new Date(surgery.scheduledAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                <p>
                  <strong>Prosedur:</strong> {surgery.procedure}
                </p>
                <p>
                  <strong>Ruang OK:</strong>{' '}
                  {surgery.assignedOR || 'Belum Ditugaskan'}
                </p>
                <p>
                  <strong>Tim Jaga:</strong>{' '}
                  {assignedTeam?.nurses
                    .map((n: { name: string }) => n.name)
                    .join(', ') || 'N/A'}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => onViewDetail(surgery)}
                >
                  Detail
                </Button>
                <Link href={`/operasi/${surgery.id}`} className="flex-1">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <PlayCircle size={16} className="mr-2" /> Kelola
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
