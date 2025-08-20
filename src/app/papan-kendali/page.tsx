'use client';
import { useState } from 'react';
import { mockScheduledSurgeries, mockStaffMembers, mockShiftAssignments } from '@/lib/mock-data';
import { ScheduledSurgery, StaffMember } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { PhoneCall } from 'lucide-react';
import AssignORModal from '@/components/kendali/AssignORModal';
import StaffSelectionModal from '@/components/Team/StafSelectionModal'; // Impor langsung

export default function PapanKendaliPage() {
  const todayStr = '2025-08-19';
  const [schedule, setSchedule] = useState<ScheduledSurgery[]>(
    mockScheduledSurgeries.filter(s => s.scheduledAt.startsWith(todayStr) && s.status !== 'Dibatalkan')
  );
  
  const [selectedSurgery, setSelectedSurgery] = useState<ScheduledSurgery | null>(null);
  const [modal, setModal] = useState<'assignOR' | 'assignTeam' | null>(null);

  const handleCallPatient = (id: string) => {
    setSchedule(prev => prev.map(s => s.id === id ? { ...s, status: 'Dipanggil' } : s));
  };
  
  const handleAssignOR = (orNumber: string) => {
    if (!selectedSurgery) return;
    setSchedule(prev => prev.map(s => s.id === selectedSurgery.id ? { ...s, assignedOR: orNumber } : s));
    setModal(null);
  };
  
  const handleAssignTeam = (team: StaffMember[]) => {
    if (!selectedSurgery) return;
    // Dapatkan Dokter Anestesi dari shift jaga default
    const anesthesiologist = mockShiftAssignments.find(a => a.shift === 'Pagi')?.anesthesiologist || mockStaffMembers[0];
    setSchedule(prev => prev.map(s => 
      s.id === selectedSurgery.id ? { ...s, assignedTeam: { anesthesiologist, nurses: team } } : s
    ));
    setModal(null);
  };
  
  return (
    <div className="p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Papan Kendali Operasi - Hari Ini</h1>
      </header>
      
      <Card className="overflow-x-auto">
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
            {schedule.map(surgery => (
              <tr key={surgery.id} className="dark:hover:bg-gray-800">
                <td className="p-3"><p className="font-medium">{surgery.patientName}</p><p className="text-xs text-gray-500">{surgery.mrn}</p></td>
                <td className="p-3">{new Date(surgery.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="p-3">
                  {surgery.assignedOR || <span className="text-gray-400 italic">...</span>}
                  <button onClick={() => { setSelectedSurgery(surgery); setModal('assignOR'); }} className="ml-2 text-xs text-blue-500 hover:underline">[Atur]</button>
                </td>
                <td className="p-3">
                  {surgery.assignedTeam?.nurses.length || 0} Perawat
                  <button onClick={() => { setSelectedSurgery(surgery); setModal('assignTeam'); }} className="ml-2 text-xs text-blue-500 hover:underline">[Atur]</button>
                </td>
                <td className="p-3"><Badge>{surgery.status}</Badge></td>
                <td className="p-3 text-center">
                  <Button size="sm" onClick={() => handleCallPatient(surgery.id)} disabled={!surgery.assignedOR || !surgery.assignedTeam || surgery.status !== 'Terkonfirmasi'}>
                    <PhoneCall size={14} className="mr-2" /> Panggil
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      
      {modal === 'assignOR' && selectedSurgery && (
        <AssignORModal 
          onClose={() => setModal(null)} 
          onAssign={handleAssignOR}
        />
      )}
      
      {modal === 'assignTeam' && selectedSurgery && (
        <StaffSelectionModal 
          title={`Atur Tim Perawat untuk ${selectedSurgery.patientName}`}
          staffList={mockStaffMembers.filter(s => s.role.includes('Perawat'))}
          initialSelection={selectedSurgery.assignedTeam?.nurses || []}
          onClose={() => setModal(null)}
          onSave={handleAssignTeam}
        />
      )}
    </div>
  );
}