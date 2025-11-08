'use client';
import { ScheduledSurgery } from '@/types';
import {Card }from '@/components/ui/ui/card';
import {Button} from '@/components/ui/ui/button';
import {Badge} from '@/components/ui/ui/badge';
import { PhoneCall } from 'lucide-react';

interface ControlBoardTableProps {
  schedule: ScheduledSurgery[];
  onCallPatient: (id: string) => void;
  onAssignOR: (surgery: ScheduledSurgery) => void;
  onAssignTeam: (surgery: ScheduledSurgery) => void;
}

export default function ControlBoardTable({
  schedule,
  onCallPatient,
  onAssignOR,
  onAssignTeam,
}: ControlBoardTableProps) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-slate-400 dark:bg-gray-200">
          <tr className="text-left text-slate-200">
            <th className="p-3">Pasien</th>
            <th className="p-3">Jadwal</th>
            <th className="p-3">Ruang OK</th>
            <th className="p-3">Tim Perawat</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-center">Aksi</th>
          </tr>
        </thead>

        <tbody className="divide-y dark:divide-gray-700">
          {schedule.map((surgery) => (
            <tr key={surgery.id} className="dark:hover:bg-gray-800">
              <td className="p-3">
                <p className="font-medium">{surgery.patientName}</p>
                <p className="text-xs text-gray-500">{surgery.mrn}</p>
              </td>

              <td className="p-3">
                {new Date(surgery.scheduledAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>

              <td className="p-3">
                {surgery.assignedOR || (
                  <span className="text-gray-400 italic">...</span>
                )}
                <button
                  onClick={() => onAssignOR(surgery)}
                  className="ml-2 text-xs text-blue-500 hover:underline"
                >
                  [Atur]
                </button>
              </td>

              <td className="p-3">
                {surgery.assignedTeam?.nurseIds?.length || 0} Perawat
                <button
                  onClick={() => onAssignTeam(surgery)}
                  className="ml-2 text-xs text-blue-500 hover:underline"
                >
                  [Atur]
                </button>
              </td>

              <td className="p-3">
                <Badge>{surgery.status}</Badge>
              </td>

              <td className="p-3 text-center">
                <Button
                  size="sm"
                  onClick={() => onCallPatient(surgery.id)}
                  disabled={
                    !surgery.assignedOR ||
                    !surgery.assignedTeam ||
                    surgery.status !== 'Terkonfirmasi'
                  }
                >
                  <PhoneCall size={14} className="mr-2" /> Panggil
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
