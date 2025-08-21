'use client';
import { useState } from 'react';
import { mockStaffMembers, mockShiftAssignments } from '@/lib/mock-data';
import { ScheduledSurgery, StaffMember } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { PhoneCall } from 'lucide-react';
import AssignORModal from '@/components/kendali/AssignORModal';
import AssignTeamModal from '@/components/kendali/AssignTeamModal';
import { getCurrentShift } from '@/lib/utils';

interface ControlBoardProps {
  initialSchedule: ScheduledSurgery[];
  onScheduleUpdate: (updatedSchedule: ScheduledSurgery[]) => void;
}

export default function ControlBoard({ initialSchedule, onScheduleUpdate }: ControlBoardProps) {
  const [schedule, setSchedule] = useState<ScheduledSurgery[]>(initialSchedule);
  const [selectedSurgery, setSelectedSurgery] = useState<ScheduledSurgery | null>(null);
  const [modal, setModal] = useState<"assignOR" | "assignTeam" | null>(null);

  const updateSchedule = (newSchedule: ScheduledSurgery[]) => {
    setSchedule(newSchedule);
    onScheduleUpdate(newSchedule);
  };

  const handleCallPatient = (id: string) => {
    const newStatus: ScheduledSurgery['status'] = "Dipanggil";
    const newSchedule = schedule.map(s => s.id === id ? { ...s, status: newStatus } : s);
    updateSchedule(newSchedule);
  };

  const handleAssignOR = (orNumber: string) => {
    if (!selectedSurgery) return;
    const newStatus: ScheduledSurgery['status'] = 'Terkonfirmasi';
    const newSchedule = schedule.map(s => s.id === selectedSurgery.id ? { ...s, assignedOR: orNumber, status: newStatus } : s);
    updateSchedule(newSchedule);
    setModal(null);
  };

  const handleAssignTeam = (team: StaffMember[]) => {
    if (!selectedSurgery) return;
    const activeShift = getCurrentShift();
    const anesthesiologist = mockShiftAssignments.find(a => a.shift === activeShift)?.anesthesiologist || mockStaffMembers[0];
    const newSchedule = schedule.map(s => s.id === selectedSurgery.id ? { ...s, assignedTeam: { anesthesiologist, nurses: team } } : s);
    updateSchedule(newSchedule);
    setModal(null);
  };

  return (
    <>
      <Card className="overflow-x-auto">
        {/* SOLUSI: Tambahkan kembali JSX untuk tabel */}
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
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
                <td className="p-3"><p className="font-medium">{surgery.patientName}</p><p className="text-xs text-gray-500">{surgery.mrn}</p></td>
                <td className="p-3">{new Date(surgery.scheduledAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</td>
                <td className="p-3">
                  {surgery.assignedOR || <span className="text-gray-400 italic">...</span>}
                  <button onClick={() => { setSelectedSurgery(surgery); setModal("assignOR"); }} className="ml-2 text-xs text-blue-500 hover:underline">[Atur]</button>
                </td>
                <td className="p-3">
                  {surgery.assignedTeam?.nurses.length || 0} Perawat
                  <button onClick={() => { setSelectedSurgery(surgery); setModal("assignTeam"); }} className="ml-2 text-xs text-blue-500 hover:underline">[Atur]</button>
                </td>
                <td className="p-3"><Badge>{surgery.status}</Badge></td>
                <td className="p-3 text-center">
                  <Button
                    size="sm"
                    onClick={() => handleCallPatient(surgery.id)}
                    disabled={!surgery.assignedOR || !surgery.assignedTeam || surgery.status !== "Terkonfirmasi"}
                  >
                    <PhoneCall size={14} className="mr-2" /> Panggil
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {modal === "assignOR" && selectedSurgery && (
        <AssignORModal onClose={() => setModal(null)} onAssign={handleAssignOR} />
      )}
      {modal === "assignTeam" && selectedSurgery && (
        <AssignTeamModal patientName={selectedSurgery.patientName} initialTeam={selectedSurgery.assignedTeam?.nurses || []} onClose={() => setModal(null)} onAssign={handleAssignTeam} />
      )}
    </>
  );
}